CREATE TABLE IF NOT EXISTS company (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(255),
    address TEXT,
    phone VARCHAR(255),
    email VARCHAR(255),
    website VARCHAR(255),
    taxId VARCHAR(255),
    logoUrl VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    address TEXT,
    balance DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2)
);

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
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(255) PRIMARY KEY,
    invoiceId VARCHAR(255),
    productId VARCHAR(255),
    name VARCHAR(255),
    quantity INT,
    price DECIMAL(10, 2),
    total DECIMAL(10, 2),
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    invoiceId VARCHAR(255),
    date DATE,
    amount DECIMAL(10, 2),
    method VARCHAR(255),
    note TEXT,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
    id VARCHAR(255) PRIMARY KEY,
    action ENUM('Created', 'Updated', 'Deleted', 'Payment'),
    entityType ENUM('Invoice', 'Customer', 'Product'),
    entityName VARCHAR(255),
    timestamp DATETIME,
    details TEXT
);
