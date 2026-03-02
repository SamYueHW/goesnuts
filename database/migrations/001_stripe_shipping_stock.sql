-- ============================================
-- Migration Script: Stripe Payment, Shipping Discount, and Stock Management
-- Date: 2026-03-03
-- Description: Add fields for Stripe payment integration, shipping discount tiers, and out of stock management
-- ============================================

-- 1. Add shipping discount tiers configuration field to store_online_information table
ALTER TABLE store_online_information 
ADD COLUMN IF NOT EXISTS ShippingDiscountTiers JSON DEFAULT NULL 
COMMENT 'Shipping discount tier configuration [{"threshold": 50, "discount": 5}]';

-- 2. Ensure OutOfStock field exists in stockitem table
ALTER TABLE stockitem 
ADD COLUMN IF NOT EXISTS OutOfStock TINYINT(1) DEFAULT 0 
COMMENT '0=In Stock, 1=Out of Stock';

-- 3. Ensure orders table has Stripe payment ID field
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS StripePaymentId VARCHAR(255) DEFAULT NULL
COMMENT 'Stripe payment intent ID';

-- 4. Add index on OutOfStock for better query performance
ALTER TABLE stockitem 
ADD INDEX IF NOT EXISTS idx_outofstock (OutOfStock);

-- 5. Add index on StripePaymentId for webhook lookups
ALTER TABLE orders 
ADD INDEX IF NOT EXISTS idx_stripe_payment_id (StripePaymentId);

-- ============================================
-- Verification Queries (Run these to verify the migration)
-- ============================================

-- Check if ShippingDiscountTiers column exists
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'store_online_information' 
  AND COLUMN_NAME = 'ShippingDiscountTiers';

-- Check if OutOfStock column exists
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'stockitem' 
  AND COLUMN_NAME = 'OutOfStock';

-- Check if StripePaymentId column exists
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'orders' 
  AND COLUMN_NAME = 'StripePaymentId';

-- ============================================
-- Rollback Script (If needed)
-- ============================================

-- To rollback this migration, run:
-- ALTER TABLE store_online_information DROP COLUMN IF EXISTS ShippingDiscountTiers;
-- ALTER TABLE stockitem DROP COLUMN IF EXISTS OutOfStock;
-- ALTER TABLE orders DROP COLUMN IF EXISTS StripePaymentId;
-- ALTER TABLE stockitem DROP INDEX IF EXISTS idx_outofstock;
-- ALTER TABLE orders DROP INDEX IF EXISTS idx_stripe_payment_id;
