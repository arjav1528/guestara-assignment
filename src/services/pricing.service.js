import { Item } from '../models/item.model.js';
import { getItemTaxInfo, calculateTaxAmount } from './tax.service.js';

const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const getCurrentTimeInMinutes = (date = new Date()) => {
    return date.getHours() * 60 + date.getMinutes();
};

export const calculateStaticPrice = (pricing) => {
    if (pricing.type !== 'static') {
        throw new Error('Pricing type must be static');
    }
    if (pricing.price === null || pricing.price === undefined) {
        throw new Error('Price is required for static pricing');
    }
    return pricing.price;
};

export const calculateTieredPrice = (pricing, duration) => {
    if (pricing.type !== 'tiered') {
        throw new Error('Pricing type must be tiered');
    }
    if (!pricing.tiers || pricing.tiers.length === 0) {
        throw new Error('Tiers are required for tiered pricing');
    }
    if (duration === null || duration === undefined || duration < 0) {
        throw new Error('Duration is required for tiered pricing');
    }

    const sortedTiers = [...pricing.tiers].sort((a, b) => a.max - b.max);

    for (const tier of sortedTiers) {
        if (duration <= tier.max) {
            return tier.price;
        }
    }

    return sortedTiers[sortedTiers.length - 1].price;
};

export const calculateComplimentaryPrice = (pricing) => {
    if (pricing.type !== 'complimentary') {
        throw new Error('Pricing type must be complimentary');
    }
    return 0;
};

export const calculateDiscountedPrice = (pricing) => {
    if (pricing.type !== 'discounted') {
        throw new Error('Pricing type must be discounted');
    }
    if (pricing.basePrice === null || pricing.basePrice === undefined) {
        throw new Error('Base price is required for discounted pricing');
    }
    if (!pricing.discountType || pricing.discountValue === null || pricing.discountValue === undefined) {
        throw new Error('Discount type and value are required for discounted pricing');
    }

    let discountAmount = 0;

    if (pricing.discountType === 'flat') {
        discountAmount = pricing.discountValue;
    } else if (pricing.discountType === 'percentage') {
        discountAmount = (pricing.basePrice * pricing.discountValue) / 100;
    }

    const finalPrice = pricing.basePrice - discountAmount;

    if (finalPrice < 0) {
        throw new Error('Final price cannot be negative');
    }

    return finalPrice;
};

export const calculateDynamicPrice = (pricing, requestTime = new Date()) => {
    if (pricing.type !== 'dynamic') {
        throw new Error('Pricing type must be dynamic');
    }
    if (!pricing.timeWindows || pricing.timeWindows.length === 0) {
        throw new Error('Time windows are required for dynamic pricing');
    }

    const currentTime = getCurrentTimeInMinutes(requestTime);

    for (const window of pricing.timeWindows) {
        const windowStart = parseTime(window.start);
        const windowEnd = parseTime(window.end);

        if (currentTime >= windowStart && currentTime < windowEnd) {
            return {
                price: window.price,
                available: true,
                timeWindow: {
                    start: window.start,
                    end: window.end,
                },
            };
        }
    }

    return {
        price: null,
        available: false,
        message: 'Item is not available at this time',
    };
};

export const calculateItemBasePrice = (item, params = {}) => {
    if (!item || !item.pricing) {
        throw new Error('Item or pricing configuration not found');
    }

    const { pricing } = item;
    const { duration, requestTime } = params;

    switch (pricing.type) {
        case 'static':
            return {
                basePrice: calculateStaticPrice(pricing),
                pricingType: 'static',
                appliedRule: { type: 'static', price: pricing.price },
            };

        case 'tiered':
            if (duration === null || duration === undefined) {
                throw new Error('Duration parameter is required for tiered pricing');
            }
            const tieredPrice = calculateTieredPrice(pricing, duration);
            const appliedTier = pricing.tiers.find(
                (tier) => duration <= tier.max && tier.price === tieredPrice,
            ) || pricing.tiers.sort((a, b) => a.max - b.max)[pricing.tiers.length - 1];
            return {
                basePrice: tieredPrice,
                pricingType: 'tiered',
                appliedRule: {
                    type: 'tiered',
                    duration,
                    tier: appliedTier,
                },
            };

        case 'complimentary':
            return {
                basePrice: calculateComplimentaryPrice(pricing),
                pricingType: 'complimentary',
                appliedRule: { type: 'complimentary' },
            };

        case 'discounted':
            const discountedPrice = calculateDiscountedPrice(pricing);
            return {
                basePrice: discountedPrice,
                pricingType: 'discounted',
                appliedRule: {
                    type: 'discounted',
                    basePrice: pricing.basePrice,
                    discountType: pricing.discountType,
                    discountValue: pricing.discountValue,
                    finalPrice: discountedPrice,
                },
            };

        case 'dynamic':
            const dynamicResult = calculateDynamicPrice(pricing, requestTime);
            if (!dynamicResult.available) {
                return {
                    basePrice: null,
                    pricingType: 'dynamic',
                    available: false,
                    message: dynamicResult.message,
                };
            }
            return {
                basePrice: dynamicResult.price,
                pricingType: 'dynamic',
                available: true,
                appliedRule: {
                    type: 'dynamic',
                    timeWindow: dynamicResult.timeWindow,
                    requestTime: requestTime || new Date(),
                },
            };

        default:
            throw new Error(`Unsupported pricing type: ${pricing.type}`);
    }
};

export const calculateItemPrice = async (itemId, params = {}) => {
    const item = await Item.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    const basePriceResult = calculateItemBasePrice(item, params);

    if (!basePriceResult.available && basePriceResult.available !== undefined) {
        return {
            ...basePriceResult,
            taxApplicable: false,
            taxPercentage: 0,
            taxAmount: 0,
            grandTotal: null,
            finalPrice: null,
        };
    }

    const basePrice = basePriceResult.basePrice;

    const taxInfo = await getItemTaxInfo(item);
    const taxAmount = calculateTaxAmount(basePrice, taxInfo.taxPercentage);
    const grandTotal = basePrice + taxAmount;

    return {
        ...basePriceResult,
        taxApplicable: taxInfo.taxApplicable,
        taxPercentage: taxInfo.taxPercentage,
        taxAmount,
        grandTotal,
        finalPrice: grandTotal,
    };
};

export const pricingService = {
    calculateStaticPrice,
    calculateTieredPrice,
    calculateComplimentaryPrice,
    calculateDiscountedPrice,
    calculateDynamicPrice,
    calculateItemBasePrice,
    calculateItemPrice,
};
