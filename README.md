# Plain Walls — Minimalist Gallery Shop

A full-stack editorial web shop for laminated art posters and framed prints for home decor. Built with a calm gallery aesthetic: lots of whitespace, thin 1px borders, warm off-white tones, and zero generic UI component bloat.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Database Schemas](#database-schemas)
5. [Architecture: How Frontend, Backend & MongoDB Connect](#architecture-how-frontend-backend--mongodb-connect)
6. [API Endpoints](#api-endpoints)
7. [Installation & Setup](#installation--setup)
8. [Design Philosophy](#design-philosophy)
9. [Photography Attributions](#photography-attributions)

---

## Project Overview

**Plain Walls** is designed as an antidote to noisy e-commerce templates. Instead of loud badges and gradient banners, the website emulates the quiet atmosphere of a physical art bookshop or independent print workshop in Fort, Mumbai.

Key features:
- **Curated Catalog**: 15 distinct prints spanning 6 categories (*Abstract*, *Botanical*, *Typography*, *Architecture*, *Landscape*, *Line Art*).
- **Dynamic Filtering & Live Search**: Category pills, debounced search, and price/recency sorting powered by MongoDB queries.
- **Interactive Print Details**: Live size-variant picker (A4, A3, A2) updating prices in real-time with dimensional specifications and finish details.
- **Client Cart & Server Checkout**: Cart items persisted in `localStorage`, quantity increment/decrement, line totals, and server-validated checkout orders saved to MongoDB.
- **Protected Admin View**: Simple endpoint to review orders secured with an `ADMIN_KEY` header.

---

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: Server-served semantic HTML5, Vanilla CSS (CSS Custom Properties design system), Vanilla JS (Fetch API)
- **Configuration**: `dotenv` for environment isolation

---

## Folder Structure

```text
plain-walls/
├── server.js                  # Main Express application entry point
├── .env                       # Local environment variables (ignored by Git)
├── .env.example               # Template environment configuration
├── package.json               # Dependencies and npm scripts
├── config/
│   └── db.js                  # Mongoose MongoDB connection helper
├── models/
│   ├── Poster.js              # Poster schema (slug, sizes, category, finish, price)
│   └── Order.js               # Order schema (customer, items, total, status)
├── controllers/
│   ├── posterController.js    # Poster querying, filtering, search, and lookup logic
│   └── orderController.js     # Order placement validation and admin retrieval
├── routes/
│   ├── posters.js             # Express routes for /api/posters
│   └── orders.js              # Express routes for /api/orders
├── seed/
│   └── seed.js                # Database seeder (clears and inserts 15 posters)
└── public/
    ├── index.html             # Home page (editorial hero, featured 6 prints, process strip)
    ├── shop.html              # Catalog page (category filters, search, sort, grid)
    ├── poster.html            # Detail page (3:4 ratio view, size selector, finish info)
    ├── cart.html              # Cart & checkout page (item edit, checkout form, confirmation)
    ├── about.html             # Studio statement, framing guide, photographer credits
    ├── css/
    │   └── style.css          # Design system stylesheet (#F6F4EF, serif/sans typography)
    ├── js/
    │   ├── api.js             # Fetch wrappers, cart localStorage helpers, toast notices
    │   ├── home.js            # Home featured grid loader
    │   ├── shop.js            # Live search, category filters, catalog rendering
    │   ├── poster.js          # Detail view, size variant switcher, add to cart
    │   └── cart.js            # Cart rendering, quantity controls, order form submission
    └── images/                # High-res, compressed local JPEG images (<300KB each)
```

---

## Database Schemas

### 1. Poster Schema (`models/Poster.js`)
```javascript
{
  title: String,             // Required, trimmed
  slug: String,              // Required, unique, lowercase (e.g. "quiet-arch-no-3")
  description: String,       // Required, editorial product text
  price: Number,             // Base price in INR (e.g. 699)
  category: String,          // Enum: ['Abstract', 'Botanical', 'Typography', 'Architecture', 'Landscape', 'Line Art']
  sizes: [                   // Array of available size variants with custom pricing
    {
      label: String,         // Enum: ['A4', 'A3', 'A2']
      price: Number          // Price in INR for this specific size
    }
  ],
  finish: String,            // Enum: ['matte', 'gloss laminated']
  imageUrl: String,          // Relative asset path (e.g. "/images/arch-quiet-arch-3.jpg")
  featured: Boolean,         // Whether print appears on home page featured grid
  createdAt: Date            // Default: Date.now
}
```

### 2. Order Schema (`models/Order.js`)
```javascript
{
  customerName: String,      // Required, min 2 chars
  email: String,             // Required, valid email format
  phone: String,             // Required, contact phone number
  address: String,           // Required, complete shipping address
  items: [                   // Array of purchased posters
    {
      posterId: ObjectId,    // References Poster model
      title: String,
      size: String,          // 'A4' | 'A3' | 'A2'
      quantity: Number,      // Minimum 1
      price: Number          // Unit price in INR
    }
  ],
  total: Number,             // Verified sum total in INR
  status: String,            // Enum: ['pending', 'confirmed', 'shipped'], default: 'pending'
  createdAt: Date            // Default: Date.now
}
```

---

## Architecture: How Frontend, Backend & MongoDB Connect

```text
[ Browser / Client ]
      │
      ├── 1. Initial Page Request (GET / or GET /shop)
      │      ───> Express Static Server (`server.js` serves HTML, CSS, JS)
      │
      ├── 2. Data Fetch (Vanilla JS `fetch('/api/posters?category=Botanical')`)
      │      ───> Express Router (`routes/posters.js`)
      │            ───> Controller (`controllers/posterController.js`)
      │                  ───> Mongoose Model (`models/Poster.js`)
      │                        ───> MongoDB Database (`plain_walls`)
      │      <─── JSON Response (`{ success: true, count: 3, data: [...] }`)
      │
      ├── 3. DOM Update (Client-side rendering dynamically creates 3:4 poster cards)
      │
      ├── 4. Cart Operations (Stored in client `localStorage`, badge counters synced)
      │
      └── 5. Checkout (POST `/api/orders` with customer payload)
             ───> Server validates inputs and recalculates price integrity
             ───> Saves document to `orders` collection in MongoDB
             <─── Status 201 Created with saved Order Reference ID
```

1. **Client-Side Requests**: When a user opens `/shop.html`, `shop.js` executes and calls `fetchPosters()` in `api.js`.
2. **Server Middleware**: Express parses query parameters (`req.query.category`, `req.query.search`, `req.query.sort`).
3. **Database Layer**: Mongoose constructs a sanitized query object (e.g., regex pattern matching for search or case-insensitive category matching) and streams documents from the local MongoDB instance.
4. **Order Verification**: When placing an order, the backend verifies that item sizes, quantities, and totals are valid before committing the record to MongoDB.

---

## API Endpoints

### Posters
- `GET /api/posters`
  - Query parameters:
    - `category`: Filter by category name (e.g. `Botanical`)
    - `search`: Keyword search matching title or description (e.g. `Arch`)
    - `sort`: `price_asc` | `price_desc` | `newest` (default)
    - `featured`: `true` to return featured hero items
- `GET /api/posters/:slug`
  - Returns detailed single poster document matching slug.

### Orders
- `POST /api/orders`
  - Request Body:
    ```json
    {
      "customerName": "Meera Patel",
      "email": "meera@example.com",
      "phone": "+91 98200 12345",
      "address": "12 Malabar Hill Road, Mumbai 400006",
      "items": [
        {
          "posterId": "6acbdcb9f5612b26f8c63226",
          "title": "Quiet Arch No. 3",
          "size": "A3",
          "quantity": 1,
          "price": 1199
        }
      ]
    }
    ```
  - Response: `201 Created` with generated order ID and summary.
- `GET /api/orders`
  - Admin view protected by header `x-admin-key: plainwalls_admin_secret_2026`.
  - Returns array of all placed orders sorted newest first.

---

## Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24.x recommended)
- **MongoDB**: Local MongoDB instance running on port `27017` or a MongoDB Atlas connection URI.

### 2. Clone / Open Project
```bash
cd "c:\Website folderr"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` (or verify `.env` exists):
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/plain_walls
ADMIN_KEY=plainwalls_admin_secret_2026
```

### 5. Seed Database
Populate the database with the 15 curated poster products:
```bash
npm run seed
```
*Output will confirm: `[Seed] Successfully inserted 15 posters across all categories.`*

### 6. Run the Application
Start the server:
```bash
npm start
```
For automatic file reloading during development:
```bash
npm run dev
```

Open your browser at:
**[http://localhost:3000](http://localhost:3000)**

---

## Design Philosophy

- **Palette**: Warm gallery beige background (`#EFE8DC`), slightly deeper container beige (`#E6DFD2`), near-black text (`#1A1A1A`), muted umber accent (`#7A7062`), and subtle 1px border lines (`#D8CFBF`).
- **Typography**: Editorial contrast between `Cormorant Garamond` (high-contrast serif for headings) and `Inter` (clean, legible sans-serif for specifications and body copy).
- **Proportions**: Authentic 3:4 portrait poster ratio cards, crisp rectangular buttons (no oversized rounded pills), and zero decorative box shadows or blur effects.
- **Micro-Transitions**: Restrained 220ms ease transitions for opacity and underline accents.

---

## Photography Attributions

All imagery is licensed freely for editorial use via Unsplash:
- **Jonas Jacobsson** — *Quiet Arch No. 3*
- **Simone Hutsch** — *Geometry of Ascend No. 7*
- **Federico Respini** — *Fern Study No. 12*
- **Evie S.** — *Olive Branch Monograph*
- **Annie Spratt** — *Eucalyptus & Shadow*
- **Geordanna Cordero** — *Ochre & Mineral Forms*
- **Europeana** — *Monolith in Silence*
- **Milad Fakurian** — *Terracotta Equilibrium*
- **Jeremy Bishop** — *Dune Silence*
- **Sean Oulashin** — *Coastal Horizon No. 4*
- **Kalvis Alberts** — *Nordic Ridge Study*
- **Mika Baumeister** — *Form & Void Bauhaus Study*
- **Carolin Beck** — *Exhibition Pavilion 1923*
- **Alina Grubnyak** — *Contour Figure No. 2*
- **Spacejoy** — *Editorial Interior Room Mockup*

---

*Plain Walls — Handcrafted print editions. Fort, Mumbai.*
