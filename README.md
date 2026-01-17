# Guestara - Menu & Services Management Backend

---
### Design Principles

- Service layer separation: Business logic in services, not controllers
- Dynamic calculation: Tax and pricing calculated at runtime
- Soft deletes: Using `is_active: false` instead of deleting
- Validation first: Joi validation before business logic

---

### Core Entities

**Category**: Top-level grouping with tax settings. Unique name per restaurant.

**Subcategory**: Optional grouping under categories. Tax fields default to `null` to inherit from category.

**Item**: Products/services. Must belong to either category OR subcategory (not both). Pricing is embedded in the item document.

**Booking**: Time-slot reservations. Prevents overlapping bookings via pre-save hook.

**Addon**: Optional extras for items. Supports groups for "choose one" scenarios.

### Relationships

```
Category → Subcategory → Item
Item → Booking
Item → Addon
```

Items can belong directly to categories or through subcategories. This gives flexibility while maintaining a clear hierarchy for tax inheritance.

### Indexes

- Category: `{ name: 1, restaurant_id: 1 }` (unique)
- Subcategory: `{ name: 1, category: 1 }` (unique)
- Item: `{ name: 1, category: 1 }` and `{ name: 1, subcategory: 1 }` (unique, partial)
- Booking: `{ item: 1, startTime: 1, endTime: 1 }` (for conflict detection)

---

## Tax Inheritance

### How It Works

Tax inheritance follows: Item → Subcategory → Category

If an item belongs to a subcategory, it checks the subcategory's tax. If the subcategory's tax is `null`, it inherits from the parent category. If an item belongs directly to a category, it uses the category's tax.

Tax is calculated dynamically, not stored on items. This means when a category's tax changes, all items automatically reflect the new tax without manual updates.

### Implementation

The tax service (`src/services/tax.service.js`) traverses the inheritance chain:

- `getItemTaxInfo(itemId)` - Gets tax for an item
- `getSubcategoryTaxInfo(subcategoryId)` - Gets tax for a subcategory, inherits from category if null

### Example

```
Category: "Beverages" (tax: 18%)
  └── Subcategory: "Hot Beverages" (tax: null)
      └── Item: "Cappuccino"
          → Inherits 18% from Category
```

If the category tax changes to 20%, all items automatically use 20%.

---

## Pricing Engine

### Pricing Types

1. **Static**: Fixed price (e.g., Cappuccino = ₹200)

2. **Tiered**: Duration-based (e.g., Meeting Room: 1hr=₹300, 2hr=₹500). Requires `duration` parameter.

3. **Complimentary**: Always free (returns 0)

4. **Discounted**: Base price with discount. Supports flat or percentage discounts. Validates final price isn't negative.

5. **Dynamic**: Time-based pricing (e.g., Breakfast: ₹199 from 8am-11am). Returns unavailable if outside time windows.

### Price Calculation

The pricing service calculates base price based on type, then integrates with tax service for final price:

```
Base Price → Tax Calculation → Final Price
```

The required endpoint `GET /items/:id/price` returns complete breakdown including applied rule, base price, discount, tax, and grand total.

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/guestara
   ```

3. Start server:
   ```bash
   npm run dev
   ```

Server runs at `http://localhost:4000`


## API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Key Endpoints

**Categories**
- `POST /categories` - Create category
- `GET /categories` - List categories (pagination, sorting)
- `GET /categories/:id` - Get category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Soft delete

**Items**
- `POST /items` - Create item
- `GET /items` - List items (search, filters, pagination)
- `GET /items/:id` - Get item
- `GET /items/:id/price` - Get price breakdown (required endpoint)
- `PATCH /items/:id` - Update item
- `DELETE /items/:id` - Soft delete

**Bookings**
- `GET /items/:id/availability` - Get available slots
- `POST /items/:id/book` - Book a slot
- `GET /items/:id/bookings` - Get bookings for item
- `PATCH /items/bookings/:bookingId/cancel` - Cancel booking


## Tradeoffs


### Dynamic Tax vs Stored Tax

Chose dynamic calculation. Pros: category changes automatically reflect. Cons: slightly slower, more complex code. Required by assignment - tax changes must reflect without manual updates.

### Soft Deletes

Using `is_active: false` instead of deleting. Pros: preserves history, can restore. Cons: need to filter in queries. Required by assignment.

### Service Layer

All business logic in services. Pros: testable, reusable. Cons: more files. Worth it for maintainability.

### Joi Validation

Using Joi for validation. Pros: declarative, consistent errors. Cons: extra dependency. Standard practice, reduces boilerplate.

### What Was Simplified

- Addon groups: Basic structure exists, but "choose one" logic not fully enforced
- Pagination: Offset-based, not cursor-based (good enough for assignment)
- No caching layer
- No authentication (not required)
- Basic rate limiting

---


### Three Things I Learned

1. **Dynamic Tax Inheritance**: Implementing tax that automatically reflects category changes taught me the value of calculating derived values at runtime. Storing tax on items would have created a maintenance nightmare.

2. **Pricing Engine Complexity**: Building a flexible pricing engine with 5 types while maintaining validation was challenging. Each type has different requirements and edge cases to handle.


### Hardest Technical Challenge

**Tax Inheritance with Dynamic Calculation**

The challenge was making tax inheritance work so category changes automatically reflect in all items.

**Problem**: Items can belong to categories or subcategories, subcategories can inherit from categories, and tax must be calculated dynamically.

**Solution**: Created a service that traverses the inheritance chain. Tax is never stored on items, always calculated. Handled both populated and unpopulated Mongoose documents.

**Why it was hard**: Had to understand async patterns deeply, handle different document states, and ensure performance while maintaining correctness. Spent time debugging edge cases where documents were already populated vs when they needed fetching.

