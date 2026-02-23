const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/', verifyToken, async (req, res) => {
  try {
    const accounts = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1',
      [req.userId]
    );
    res.json(accounts.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:accountId/transactions', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );
    
    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC',
      [accountId]
    );
    
    res.json(transactions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/transfer', verifyToken, async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const fromAccount = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [fromAccountId, req.userId]
    );

    if (fromAccount.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (parseFloat(fromAccount.rows[0].balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const toAccount = await pool.query(
      'SELECT * FROM accounts WHERE account_number = $1',
      [toAccountNumber]
    );

    if (toAccount.rows.length === 0) {
      return res.status(404).json({ message: 'Recipient account not found' });
    }

    await pool.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromAccountId]
    );

    await pool.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccount.rows[0].id]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [fromAccountId, 'debit', amount, description || `Transfer to ${toAccountNumber}`]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [toAccount.rows[0].id, 'credit', amount, description || `Transfer from ${fromAccount.rows[0].account_number}`]
    );

    res.json({ 
      message: 'Transfer successful',
      newBalance: parseFloat(fromAccount.rows[0].balance) - parseFloat(amount)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;