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

router.post('/ecocash/transfer', verifyToken, async (req, res) => {
  try {
    const { accountId, ecocashNumber, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (parseFloat(account.rows[0].balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    await pool.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, accountId]
    );

    await pool.query(
      'INSERT INTO ecocash_transfers (account_id, ecocash_number, amount) VALUES ($1, $2, $3)',
      [accountId, ecocashNumber, amount]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [accountId, 'debit', amount, `EcoCash transfer to ${ecocashNumber}`]
    );

    res.json({ 
      message: 'EcoCash transfer successful',
      newBalance: parseFloat(account.rows[0].balance) - parseFloat(amount)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/bills/pay', verifyToken, async (req, res) => {
  try {
    const { accountId, billType, provider, accountNumber, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (parseFloat(account.rows[0].balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    await pool.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, accountId]
    );

    await pool.query(
      'INSERT INTO bill_payments (account_id, bill_type, provider, account_number, amount) VALUES ($1, $2, $3, $4, $5)',
      [accountId, billType, provider, accountNumber, amount]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [accountId, 'debit', amount, `${billType} payment to ${provider}`]
    );

    res.json({ 
      message: 'Bill payment successful',
      newBalance: parseFloat(account.rows[0].balance) - parseFloat(amount)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/airtime/purchase', verifyToken, async (req, res) => {
  try {
    const { accountId, phoneNumber, network, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (parseFloat(account.rows[0].balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    await pool.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, accountId]
    );

    await pool.query(
      'INSERT INTO airtime_purchases (account_id, phone_number, network, amount) VALUES ($1, $2, $3, $4)',
      [accountId, phoneNumber, network, amount]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [accountId, 'debit', amount, `${network} airtime for ${phoneNumber}`]
    );

    res.json({ 
      message: 'Airtime purchase successful',
      newBalance: parseFloat(account.rows[0].balance) - parseFloat(amount)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/diaspora/send', verifyToken, async (req, res) => {
  try {
    const { accountId, recipientName, recipientCountry, recipientPhone, recipientAccount, amount, currency } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const exchangeRates = {
      USD: 1.0,
      GBP: 0.79,
      EUR: 0.92,
      ZAR: 18.5,
      AUD: 1.52,
      CAD: 1.35,
      ZWG: 32.00
    };

    const exchangeRate = exchangeRates[currency] || 1.0;
    const fee = parseFloat(amount) * 0.02; 
    const totalDeduction = parseFloat(amount) + fee;

    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (parseFloat(account.rows[0].balance) < totalDeduction) {
      return res.status(400).json({ message: 'Insufficient funds (including fee)' });
    }
    await pool.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [totalDeduction, accountId]
    );

    await pool.query(
      'INSERT INTO diaspora_remittances (account_id, recipient_name, recipient_country, recipient_phone, recipient_account, amount, currency, exchange_rate, fee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [accountId, recipientName, recipientCountry, recipientPhone, recipientAccount, amount, currency, exchangeRate, fee]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [accountId, 'debit', totalDeduction, `Remittance to ${recipientName} in ${recipientCountry}`]
    );

    res.json({ 
      message: 'Remittance sent successfully',
      newBalance: parseFloat(account.rows[0].balance) - totalDeduction,
      fee: fee,
      exchangeRate: exchangeRate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { accountId, amount, method } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await pool.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, accountId]
    );

    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [accountId, 'credit', amount, `Deposit via ${method}`]
    );

    res.json({ 
      message: 'Deposit successful',
      newBalance: parseFloat(account.rows[0].balance) + parseFloat(amount)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { accountId, amount, method } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const account = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (parseFloat(account.rows[0].balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    await pool.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, accountId]
    );


    await pool.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [accountId, 'debit', amount, `Withdrawal via ${method}`]
    );

    res.json({ 
      message: 'Withdrawal successful',
      newBalance: parseFloat(account.rows[0].balance) - parseFloat(amount)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;