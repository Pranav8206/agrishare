# 🌾 AgriShare — Blockchain-Powered Equipment Sharing for Modern Farmers

<div align="center">

![AgriShare Banner](https://img.shields.io/badge/AgriShare-Blockchain%20%7C%20AI%20%7C%20FinTech-darkgreen?style=for-the-badge&logo=leaf&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Polygon](https://img.shields.io/badge/Polygon-8247E5?style=flat-square&logo=polygon&logoColor=white)](https://polygon.technology/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat-square&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **"No farmer should suffer due to lack of access."**
>
> AgriShare connects farmers who need equipment with owners who have idle machinery — transparently, securely, and affordably.

**Built with ❤️ by Team AgriTRAP**

</div>

---

## 📖 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Platform Workflow](#-platform-workflow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Business Model](#-business-model)
- [Impact & Benefits](#-impact--benefits)
- [Challenges & Solutions](#-challenges--solutions)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🚨 Problem Statement

In India, agricultural equipment access is broken:

| Problem                     | Reality                                                    |
| --------------------------- | ---------------------------------------------------------- |
| 🚜 Underutilized equipment  | 30–40% of farm equipment sits idle                         |
| 👨‍🌾 Unaffordable machinery   | 85%+ of farmers are small/marginal and can't afford to buy |
| 🔒 No trusted rental system | Fragmented, offline, middlemen-dependent                   |
| 💸 No price transparency    | Arbitrary pricing, no standardization                      |
| 📍 Accessibility gap        | Nearest rentals are far, expensive, and unreliable         |

### 🧑‍🌾 Real-Life Example

> **Raju**, a farmer in **Nagpur** with just **3 acres**, needs a harvester for **2 days**.
> The nearest rental is **30 km away**, expensive, and has **no clear pricing**.
> Meanwhile, **Mr. Patil's harvester** sits idle just **5 km away**.
>
> _The problem is not lack of resources — it's lack of access and trust._

---

## ✅ Our Solution

**AgriShare** is a blockchain-powered farm equipment sharing platform built to bridge this gap.

```
Farmers who NEED equipment  ←→  Owners who HAVE idle machinery
```

### Four Core Pillars

| Pillar                           | Description                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------- |
| 🚜 **Equipment Rental Platform** | Seamlessly rent & share farm equipment; maximize machine utilization         |
| 🤖 **AI-Based Analysis**         | Real-time price optimization & equipment condition analysis for safety       |
| 💳 **Secure Payment System**     | Razorpay integration for instant transactions + Escrow for multi-stage trust |
| ⛓️ **Blockchain Transparency**   | Immutable service records for every rental on Polygon Amoy TestNet           |

---

## ✨ Key Features

- 🔍 **Search nearby equipment** by location with distance indicators
- 💰 **Transparent pricing** — clear per-day rates, no hidden charges
- 🤖 **AI Price & Condition Analyzer** — fair pricing badges + estimated usage hours
- 📅 **Date-based booking** with instant confirmation
- 💳 **Razorpay payment** — secure, integrated, and tested
- ⛓️ **Blockchain-recorded transactions** — tamper-proof lease agreements
- ⭐ **Review & rating system** — build community trust
- 📱 **Mobile-first design** — optimized for rural smartphone users
- 📊 **Booking summary** — base price, delivery fee & insurance breakdown

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│                      Next.js                            │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
  ┌─────────────┐ ┌──────────┐ ┌──────────────────┐
  │  LAYER 2    │ │ BACKEND  │ │    DATABASE       │
  │   Bradt     │ │Express.js│ │    MongoDB        │
  └─────────────┘ └────┬─────┘ └────────┬─────────┘
                       │                │
              ┌────────┘       ┌─────────┘
              ▼                ▼
  ┌──────────────────┐ ┌────────────────────────┐
  │ PAYMENT GATEWAY  │ │     AI & ML            │
  │    Razorpay      │ │ Price & Condition       │
  │                  │ │     Analyzer            │
  └──────────────────┘ └────────────────────────┘
              │
              ▼
  ┌──────────────────────┐
  │      BLOCKCHAIN       │
  │  Polygon Amoy TestNet │
  └──────────────────────┘
```

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | Next.js                           |
| Backend    | Express.js (Node.js)              |
| Database   | MongoDB                           |
| Blockchain | Polygon Amoy TestNet              |
| AI/ML      | Custom Price & Condition Analyzer |
| Payments   | Razorpay                          |

---

## 🗄️ Database Schema

AgriShare uses **MongoDB** with four collections:

### 👤 `users`

```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "createdAt": "string"
}
```

### 🚜 `equipment`

```json
{
  "_id": "string",
  "name": "string",
  "type": "string",
  "pricePerDay": "number",
  "location": "string",
  "manufacturingYear": "number",
  "owner": "string (ref: users)",
  "aiReview": "string",
  "aiScore": "string"
}
```

### 📋 `bookings`

```json
{
  "_id": "string",
  "equipment": "string (ref: equipment)",
  "owner": "string (ref: users)",
  "renter": "string (ref: users)",
  "startDate": "date",
  "endDate": "date",
  "totalPrice": "number",
  "paymentId": "string",
  "transactionHash": "string",
  "status": "string"
}
```

### ⭐ `reviews`

```json
{
  "_id": "string",
  "user": "string (ref: users)",
  "equipment": "string (ref: equipment)",
  "rating": "number",
  "comment": "string"
}
```

### 🔗 Entity Relationships

```
users ──< equipment    (one user owns many equipment items)
users ──< bookings     (one user has many bookings as owner/renter)
equipment ──< bookings (one equipment has many bookings)
equipment ──< reviews  (one equipment has many reviews)
users ──< reviews      (one user writes many reviews)
```

---

## 🔄 Platform Workflow

```
  1. USER ADDS EQUIPMENT
     Owner uploads details, condition & availability
              │
              ▼
  2. FARMER SEARCHES & BOOKS
     Browse nearby equipment → Select → Book securely
              │
              ▼
  3. AI GIVES INSIGHTS
     Optimal pricing analysis + condition estimate + feedback
              │
              ▼
  4. SECURE PAYMENT VIA RAZORPAY
     Integrated payment → Secure transaction confirmed
              │
              ▼
  5. BLOCKCHAIN RECORDS TRANSACTION
     Polygon Amoy Network → Immutable lease agreement stored
              │
              ▼
  6. EQUIPMENT DELIVERY & USAGE
     Confirmed booking details → Real-time tracking
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [MetaMask](https://metamask.io/) wallet configured for Polygon Amoy TestNet
- [Razorpay](https://razorpay.com/) account (test mode)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/AgriTRAP/agrishare.git
cd agrishare
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

#### 4. Configure Environment Variables

Create `.env` files as described in the [Environment Variables](#-environment-variables) section.

#### 5. Run the Development Server

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npm run dev
```

#### 6. Open in Browser

```
http://localhost:3000
```

### Blockchain Setup

1. Open MetaMask → Add Network
2. Network Name: `Polygon Amoy TestNet`
3. RPC URL: `https://rpc-amoy.polygon.technology`
4. Chain ID: `80002`
5. Currency Symbol: `MATIC`
6. Get test MATIC from the [Polygon Amoy Faucet](https://faucet.polygon.technology/)

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address

# Server
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

> ⚠️ **Never commit `.env` files to version control.** Add them to `.gitignore`.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| `POST` | `/api/auth/register` | Register a new user         |
| `POST` | `/api/auth/login`    | Login and receive JWT token |

### Equipment

| Method   | Endpoint             | Description                       |
| -------- | -------------------- | --------------------------------- |
| `GET`    | `/api/equipment`     | List all available equipment      |
| `POST`   | `/api/equipment`     | Add new equipment listing         |
| `GET`    | `/api/equipment/:id` | Get equipment details + AI review |
| `PUT`    | `/api/equipment/:id` | Update equipment details          |
| `DELETE` | `/api/equipment/:id` | Remove equipment listing          |

### Bookings

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| `POST` | `/api/bookings`            | Create a new booking        |
| `GET`  | `/api/bookings/:userId`    | Get all bookings for a user |
| `PUT`  | `/api/bookings/:id/status` | Update booking status       |

### Payments

| Method | Endpoint                     | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| `POST` | `/api/payments/create-order` | Create Razorpay payment order         |
| `POST` | `/api/payments/verify`       | Verify payment + record on blockchain |

### Reviews

| Method | Endpoint                    | Description                   |
| ------ | --------------------------- | ----------------------------- |
| `POST` | `/api/reviews`              | Submit a review for equipment |
| `GET`  | `/api/reviews/:equipmentId` | Get all reviews for equipment |

---

## 💼 Business Model

```
📦 CURRENT REVENUE STREAMS
├── 💰 Per-booking commission (small % of rental value)
└── ⭐ Premium listings (verified badge + priority visibility)

🔮 FUTURE REVENUE STREAMS
├── 🤝 Partnerships with equipment manufacturers
├── 🏦 Financial services integration (loans, credit for farmers)
└── 🛡️ Insurance integration for equipment protection
```

---

## 🌍 Impact & Benefits

### For Farmers (Renters)

- ✅ Reduced upfront costs — no need to own machinery
- ✅ Access to diverse equipment for every farming task
- ✅ Clear, upfront pricing — no middlemen markup
- ✅ Nearby availability — reduced travel cost and time

### For Equipment Owners

- ✅ Additional income stream from idle machinery
- ✅ Even a few rentals per month = significant ROI improvement
- ✅ Verified, structured booking reduces disputes

### For Agriculture & Environment

- ✅ Maximized runtime for existing machinery
- ✅ Reduced need for new equipment manufacturing
- ✅ Promotes responsible resource allocation
- ✅ Economically and environmentally sustainable

---

## 🧩 Challenges & Solutions

| Challenge                          | Our Solution                                                      |
| ---------------------------------- | ----------------------------------------------------------------- |
| 📱 Initial adoption in rural areas | Start locally via farmer cooperatives and community leaders       |
| 🔨 Equipment damage or misuse      | Security deposits + rating system + future insurance integration  |
| 📶 Poor internet connectivity      | Lightweight, mobile-optimized design; offline agent support model |
| 💸 Price fairness concerns         | AI-driven pricing suggestions + transparent upfront display       |
| 🤝 Trust between strangers         | Blockchain-recorded agreements + verified user reviews            |

---

## 🔮 Future Roadmap

```
Phase 1 (Now)      → Core platform: listing, booking, payment, blockchain recording
Phase 2 (3 months) → Pilot in Nagpur region with local cooperatives
Phase 3 (6 months) → Insurance integration + offline agent support model
Phase 4 (1 year)   → Multi-region expansion + deeper ML pricing models
Phase 5 (2 years)  → Financial services (micro-loans for equipment purchase)
```

**Upcoming features:**

- [ ] Predictive maintenance alerts using equipment usage data
- [ ] Dynamic pricing based on seasonal demand
- [ ] Multilingual support (Hindi, Marathi, Telugu, etc.)
- [ ] Offline-first mode with sync on connectivity
- [ ] Equipment GPS tracking integration
- [ ] WhatsApp bot for rural accessibility

---

## 👥 Team

**Team AgriTRAP** — Built at Hackathon 2026

> We are building a **trust layer for rural transactions** — not just a marketplace.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌾 AgriShare — Bridging the Gap Between Farmers and Machinery

_"With AgriShare, Raju no longer struggles._
_He finds a nearby harvester, sees the price clearly, books instantly, and completes his work on time._
_That's the future we are building — where no farmer suffers due to lack of access."_

**Made with ❤️ for India's Farmers by Team AgriTRAP**

</div>
