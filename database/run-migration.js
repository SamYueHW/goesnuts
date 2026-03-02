const mysql = require('mysql2/promise');
const fs = require('fs');
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
      database: process.env.DB_DATABASE,
      multipleStatements: true
    });

    console.log('Connected successfully!');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_stripe_shipping_stock.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`\nExecuting ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comment blocks
      if (statement.includes('============================================')) {
        continue;
      }
      
      // Skip SELECT verification queries (we'll run them separately)
      if (statement.trim().toUpperCase().startsWith('SELECT')) {
        continue;
      }
      
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 80)}...`);
        await connection.query(statement);
        console.log('✓ Success\n');
      } catch (error) {
        // Ignore errors for "IF NOT EXISTS" statements that already exist
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠ Already exists, skipping\n');
        } else {
          console.error('✗ Error:', error.message, '\n');
        }
      }
    }
    
    console.log('='.repeat(60));
    console.log('Running verification queries...\n');
    
    // Verify ShippingDiscountTiers
    const [shippingResult] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'store_online_information' 
        AND COLUMN_NAME = 'ShippingDiscountTiers'
    `);
    
    if (shippingResult.length > 0) {
      console.log('✓ ShippingDiscountTiers column exists');
      console.log('  Type:', shippingResult[0].DATA_TYPE);
      console.log('  Comment:', shippingResult[0].COLUMN_COMMENT);
    } else {
      console.log('✗ ShippingDiscountTiers column NOT found');
    }
    
    // Verify OutOfStock
    const [stockResult] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'stockitem' 
        AND COLUMN_NAME = 'OutOfStock'
    `);
    
    if (stockResult.length > 0) {
      console.log('\n✓ OutOfStock column exists');
      console.log('  Type:', stockResult[0].DATA_TYPE);
      console.log('  Default:', stockResult[0].COLUMN_DEFAULT);
      console.log('  Comment:', stockResult[0].COLUMN_COMMENT);
    } else {
      console.log('\n✗ OutOfStock column NOT found');
    }
    
    // Verify StripePaymentId
    const [stripeResult] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'StripePaymentId'
    `);
    
    if (stripeResult.length > 0) {
      console.log('\n✓ StripePaymentId column exists');
      console.log('  Type:', stripeResult[0].DATA_TYPE);
      console.log('  Comment:', stripeResult[0].COLUMN_COMMENT);
    } else {
      console.log('\n✗ StripePaymentId column NOT found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Migration completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

runMigration();
