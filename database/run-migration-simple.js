const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('Connected successfully!\n');
    
    // Migration 1: Add ShippingDiscountTiers to store_online_information
    console.log('1. Adding ShippingDiscountTiers column...');
    try {
      await connection.query(`
        ALTER TABLE store_online_information 
        ADD COLUMN ShippingDiscountTiers JSON DEFAULT NULL 
        COMMENT 'Shipping discount tier configuration'
      `);
      console.log('✓ ShippingDiscountTiers column added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ ShippingDiscountTiers column already exists\n');
      } else {
        throw error;
      }
    }
    
    // Migration 2: Add OutOfStock to stockitem
    console.log('2. Adding OutOfStock column...');
    try {
      await connection.query(`
        ALTER TABLE stockitem 
        ADD COLUMN OutOfStock TINYINT(1) DEFAULT 0 
        COMMENT '0=In Stock, 1=Out of Stock'
      `);
      console.log('✓ OutOfStock column added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ OutOfStock column already exists\n');
      } else {
        throw error;
      }
    }
    
    // Migration 3: Ensure StripePaymentId exists in orders
    console.log('3. Checking StripePaymentId column...');
    try {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN StripePaymentId VARCHAR(255) DEFAULT NULL
        COMMENT 'Stripe payment intent ID'
      `);
      console.log('✓ StripePaymentId column added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ StripePaymentId column already exists\n');
      } else {
        throw error;
      }
    }
    
    // Add indexes
    console.log('4. Adding indexes...');
    try {
      await connection.query(`
        ALTER TABLE stockitem 
        ADD INDEX idx_outofstock (OutOfStock)
      `);
      console.log('✓ Index on OutOfStock added');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index on OutOfStock already exists');
      } else {
        console.log('⚠ Could not add index on OutOfStock:', error.message);
      }
    }
    
    try {
      await connection.query(`
        ALTER TABLE orders 
        ADD INDEX idx_stripe_payment_id (StripePaymentId)
      `);
      console.log('✓ Index on StripePaymentId added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index on StripePaymentId already exists\n');
      } else {
        console.log('⚠ Could not add index on StripePaymentId:', error.message, '\n');
      }
    }
    
    // Verification
    console.log('='.repeat(60));
    console.log('VERIFICATION');
    console.log('='.repeat(60));
    
    const [shippingResult] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'store_online_information' 
        AND COLUMN_NAME = 'ShippingDiscountTiers'
    `);
    
    console.log('\nShippingDiscountTiers:', shippingResult.length > 0 ? '✓ EXISTS' : '✗ NOT FOUND');
    if (shippingResult.length > 0) {
      console.log('  Type:', shippingResult[0].DATA_TYPE);
    }
    
    const [stockResult] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'stockitem' 
        AND COLUMN_NAME = 'OutOfStock'
    `);
    
    console.log('\nOutOfStock:', stockResult.length > 0 ? '✓ EXISTS' : '✗ NOT FOUND');
    if (stockResult.length > 0) {
      console.log('  Type:', stockResult[0].DATA_TYPE);
      console.log('  Default:', stockResult[0].COLUMN_DEFAULT);
    }
    
    const [stripeResult] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'StripePaymentId'
    `);
    
    console.log('\nStripePaymentId:', stripeResult.length > 0 ? '✓ EXISTS' : '✗ NOT FOUND');
    if (stripeResult.length > 0) {
      console.log('  Type:', stripeResult[0].DATA_TYPE);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Migration completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

runMigration();
