import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initDB = async () => {
  // First, connect without a database to create it if it doesn't exist
  const connectionNoDB = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('Creating database if not exists...');
    await connectionNoDB.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'invoice_db'}`);
    console.log('Database ensured.');
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await connectionNoDB.end();
  }

  // Now connect with the database to create tables
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'invoice_db',
  });

  const connection = await pool.getConnection();
  try {
    console.log('Starting table setup...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS company (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(255),
        address TEXT,
        phone VARCHAR(255),
        email VARCHAR(255),
        website VARCHAR(255),
        taxId VARCHAR(255),
        logoUrl VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(255),
        address TEXT,
        balance DECIMAL(10, 2) DEFAULT 0.00
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        price DECIMAL(10, 2)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(255) PRIMARY KEY,
        invoiceNumber VARCHAR(255),
        customerId VARCHAR(255),
        date DATE,
        subtotal DECIMAL(10, 2),
        taxRate DECIMAL(5, 2),
        taxAmount DECIMAL(10, 2),
        discount DECIMAL(10, 2),
        total DECIMAL(10, 2),
        amountPaid DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('Draft', 'Sent', 'Partially Paid', 'Paid'),
        notes TEXT,
        FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id VARCHAR(255) PRIMARY KEY,
        invoiceId VARCHAR(255),
        productId VARCHAR(255),
        name VARCHAR(255),
        quantity INT,
        price DECIMAL(10, 2),
        total DECIMAL(10, 2),
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        invoiceId VARCHAR(255),
        date DATE,
        amount DECIMAL(10, 2),
        method VARCHAR(255),
        note TEXT,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id VARCHAR(255) PRIMARY KEY,
        action ENUM('Created', 'Updated', 'Deleted', 'Payment'),
        entityType ENUM('Invoice', 'Customer', 'Product'),
        entityName VARCHAR(255),
        timestamp DATETIME,
        details TEXT
      )
    `);

    console.log('Database tables setup successfully.');
  } catch (error) {
    console.error('Error setting up database tables:', error);
  } finally {
    connection.release();
  }
};

initDB();
