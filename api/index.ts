import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Company Endpoints ---
app.get('/api/company', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM company WHERE id = 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company', async (req, res) => {
  const { name, address, phone, email, website, taxId, logoUrl } = req.body;
  try {
    await pool.query(
      'INSERT INTO company (id, name, address, phone, email, website, taxId, logoUrl) VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, address=?, phone=?, email=?, website=?, taxId=?, logoUrl=?',
      [name, address, phone, email, website, taxId, logoUrl, name, address, phone, email, website, taxId, logoUrl]
    );
    res.json({ message: 'Company updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Customer Endpoints ---
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { id, name, email, phone, address, balance } = req.body;
  try {
    await pool.query(
      'INSERT INTO customers (id, name, email, phone, address, balance) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, email=?, phone=?, address=?, balance=?',
      [id, name, email, phone, address, balance, name, email, phone, address, balance]
    );
    res.json({ message: 'Customer saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Inventory Endpoints ---
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { id, name, description, price } = req.body;
  try {
    await pool.query(
      'INSERT INTO inventory (id, name, description, price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, description=?, price=?',
      [id, name, description, price, name, description, price]
    );
    res.json({ message: 'Product saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Invoice Endpoints ---
app.get('/api/invoices', async (req, res) => {
  try {
    const [invoices]: any = await pool.query('SELECT * FROM invoices');
    for (let inv of invoices) {
      const [items]: any = await pool.query('SELECT * FROM invoice_items WHERE invoiceId = ?', [inv.id]);
      const [payments]: any = await pool.query('SELECT * FROM payments WHERE invoiceId = ?', [inv.id]);
      inv.items = items;
      inv.payments = payments;
    }
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  const { id, invoiceNumber, customerId, date, subtotal, taxRate, taxAmount, discount, total, amountPaid, status, notes, items } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.query(
      'INSERT INTO invoices (id, invoiceNumber, customerId, date, subtotal, taxRate, taxAmount, discount, total, amountPaid, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE invoiceNumber=?, customerId=?, date=?, subtotal=?, taxRate=?, taxAmount=?, discount=?, total=?, amountPaid=?, status=?, notes=?',
      [id, invoiceNumber, customerId, date, subtotal, taxRate, taxAmount, discount, total, amountPaid, status, notes, invoiceNumber, customerId, date, subtotal, taxRate, taxAmount, discount, total, amountPaid, status, notes]
    );

    // Delete old items and insert new ones
    await connection.query('DELETE FROM invoice_items WHERE invoiceId = ?', [id]);
    for (let item of items) {
      await connection.query(
        'INSERT INTO invoice_items (id, invoiceId, productId, name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.id, id, item.productId, item.name, item.quantity, item.price, item.total]
      );
    }

    await connection.commit();
    res.json({ message: 'Invoice saved' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Activity Log Endpoints ---
app.get('/api/activities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM activity_log ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', async (req, res) => {
  const { id, action, entityType, entityName, timestamp, details } = req.body;
  try {
    await pool.query(
      'INSERT INTO activity_log (id, action, entityType, entityName, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)',
      [id, action, entityType, entityName, timestamp, details]
    );
    res.json({ message: 'Activity logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Payment Endpoints ---
app.post('/api/payments', async (req, res) => {
  const { id, invoiceId, date, amount, method, note } = req.body;
  try {
    await pool.query(
      'INSERT INTO payments (id, invoiceId, date, amount, method, note) VALUES (?, ?, ?, ?, ?, ?)',
      [id, invoiceId, date, amount, method, note]
    );
    res.json({ message: 'Payment added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
