# 🏦 PrimePay - Global Connect Banking Application

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
</div>

## 📖 About

PrimePay is a modern, full-stack digital banking platform designed to provide comprehensive financial services with a focus on both local and international transactions. Built with a sleek black, blue, and gold theme, PrimePay offers an intuitive user experience for managing personal finances across borders.

## ✨ Features

### 🏦 Core Banking Services
- **Account Management**: Secure user registration and authentication with JWT tokens
- **Bank Transfers**: Seamless money transfers between PrimePay accounts
- **Real-time Balance Updates**: Instant balance reflection after every transaction
- **Transaction History**: Complete audit trail of all financial activities

### 📱 Mobile Money Integration
- **EcoCash Transfers**: Direct integration with EcoCash mobile money platform
- **Airtime Purchases**: Buy airtime for Econet, NetOne, and Telecel networks
- **Deposit & Withdrawal**: Multiple methods including bank transfer, cash, and mobile money

### 💡 Bill Payment Services
- **Utility Bills**: Pay electricity (ZESA), water, and internet bills
- **TV Subscriptions**: Manage and pay for television subscription services
- **Provider Integration**: Support for major Zimbabwean service providers

### 🌍 International Remittances
- **Diaspora Services**: Send money to 5+ countries (South Africa, UK, USA, Canada, Australia)
- **Multi-Currency Support**: Transactions in USD, GBP, EUR, ZAR, AUD, and CAD
- **Transparent Fees**: Clear 2% transfer fee with real-time exchange rate calculations
- **Flexible Delivery**: Recipients can receive funds via bank account or cash pickup

### 🎨 User Experience
- **Modern UI/UX**: Professional interface with smooth animations
- **Loading States**: Beautiful loading screens and transaction processing animations
- **Secure Authentication**: Password hashing with bcrypt and JWT-based sessions
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React.js** - Dynamic user interfaces
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Custom Components** - Reusable UI components with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### Security
- Environment variable configuration with dotenv
- Secure password hashing (bcrypt with salt rounds)
- Protected API routes with JWT verification
- Input validation and sanitization
- CORS enabled for cross-origin requests

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Tad1wa/Banking-App.git
cd Banking-App
```

2. **Set up the Backend**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `backend` folder:
```env
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=banking_app
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your-super-secret-key-change-this
PORT=5001
```

4. **Set up the Database**
```bash
# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb banking_app

# Connect to database and create tables
psql banking_app

# Run the following SQL commands:
```
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  account_number VARCHAR(20) UNIQUE NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ecocash_transfers (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  ecocash_number VARCHAR(15) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bill_payments (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  bill_type VARCHAR(50) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE airtime_purchases (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  phone_number VARCHAR(15) NOT NULL,
  network VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diaspora_remittances (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  recipient_name VARCHAR(100) NOT NULL,
  recipient_country VARCHAR(50) NOT NULL,
  recipient_phone VARCHAR(15),
  recipient_account VARCHAR(50),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(10, 4),
  fee DECIMAL(12, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Exit psql with `\q`

5. **Start the Backend Server**
```bash
npx nodemon server.js
```

The backend should now be running on `http://localhost:5001`

6. **Set up the Frontend**

Open a new terminal window:
```bash
cd frontend
npm install
npm start
```

The frontend should now be running on `http://localhost:3000`

## 📱 Usage

1. **Register a new account** at the registration page
2. **Login** with your credentials
3. **Explore features**:
   - View your account balance on the Overview page
   - Make bank transfers to other accounts
   - Send money via EcoCash
   - Pay bills for utilities
   - Buy airtime for mobile networks
   - Send international remittances
   - Deposit and withdraw funds

## 🎯 Project Structure
```
banking-app/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── accounts.js          # Account management routes
│   │   └── services.js          # Payment services routes
│   ├── server.js                # Express server setup
│   ├── .env                     # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── PageLoader.js
│   │   │   └── ProcessingAnimation.js
│   │   ├── pages/               # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── Profile.js
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Main app component
│   │   └── index.js             # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: API endpoints require valid JWT tokens
- **Input Validation**: Server-side validation for all inputs
- **Environment Variables**: Sensitive data stored in .env files
- **CORS Configuration**: Controlled cross-origin resource sharing

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Tad1wa/Banking-App/issues).

## 📝 License

This project is for educational purposes. Feel free to use it as a learning resource or foundation for your own projects.

## 👨‍💻 Author

**Tadiwa**
- GitHub: [@Tad1wa](https://github.com/Tad1wa)

## 🙏 Acknowledgments

- Built as a learning project to understand full-stack development
- Inspired by modern banking applications and fintech solutions
- Special thanks to the open-source community

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

⭐ If you found this project helpful, please consider giving it a star on GitHub!