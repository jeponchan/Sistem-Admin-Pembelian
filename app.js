const express = require('express');
const path = require('path');
const db = require('./config/db');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Dashboard stok produk
app.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, p.price, s.quantity
     FROM products p
     JOIN product_stock s ON p.id = s.product_id`
  );
  res.render('index', { products: rows });
});

// Halaman produk
app.get('/products', async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, p.price, s.quantity
     FROM products p
     JOIN product_stock s ON p.id = s.product_id`
  );
  res.render('products', { products: rows });
});

// Daftar pembelian
app.get('/purchases', async (req, res) => {
  const [rows] = await db.query(
    `SELECT pu.id, p.name AS product_name, pu.quantity,
            pu.total_price, pu.status, pu.created_at, pu.cancelled_at
     FROM purchases pu
     JOIN products p ON pu.product_id = p.id
     ORDER BY pu.created_at DESC`
  );
  res.render('purchases', { purchases: rows });
});

// Form input pembelian
app.get('/purchases/new', async (req, res) => {
  const [products] = await db.query(
    'SELECT id, name, price FROM products'
  );
  res.render('purchase_form', { products });
});

// Simpan pembelian (tambah stok)
app.post('/purchases', async (req, res) => {
  const { product_id, quantity } = req.body;
  const q = parseInt(quantity, 10);

  const [[product]] = await db.query(
    'SELECT price FROM products WHERE id = ?',
    [product_id]
  );
  if (!product) return res.status(400).send('Produk tidak ditemukan');

  const totalPrice = product.price * q;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO purchases (product_id, quantity, total_price, status)
       VALUES (?, ?, ?, 'CONFIRMED')`,
      [product_id, q, totalPrice]
    );

    await conn.query(
      `UPDATE product_stock
       SET quantity = quantity + ?
       WHERE product_id = ?`,
      [q, product_id]
    );

    await conn.commit();
    res.redirect('/purchases');
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).send('Gagal menyimpan pembelian');
  } finally {
    conn.release();
  }
});

// Cancel pembelian (admin)
app.post('/purchases/:id/cancel', async (req, res) => {
  const purchaseId = req.params.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[purchase]] = await conn.query(
      'SELECT * FROM purchases WHERE id = ? FOR UPDATE',
      [purchaseId]
    );
    if (!purchase) {
      await conn.rollback();
      return res.status(404).send('Pembelian tidak ditemukan');
    }
    if (purchase.status === 'CANCELLED') {
      await conn.rollback();
      return res.redirect('/purchases');
    }

    await conn.query(
      `UPDATE purchases
       SET status = 'CANCELLED',
           cancelled_at = NOW()
       WHERE id = ?`,
      [purchaseId]
    );

    await conn.query(
      `UPDATE product_stock
       SET quantity = quantity - ?
       WHERE product_id = ?`,
      [purchase.quantity, purchase.product_id]
    );

    await conn.commit();
    res.redirect('/purchases');
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).send('Gagal membatalkan pembelian');
  } finally {
    conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
