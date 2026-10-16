# NovaMart — Full-Stack Commercial E-Commerce Platform

A production-grade, commercial full-stack e-commerce web platform inspired by **Amazon** and **Flipkart**, built using **Node.js, Express.js, MongoDB (Mongoose ODM), Vanilla Modern CSS, and Vanilla JavaScript**.

Designed specifically for **academic assignment presentations and live project evaluations**, featuring real-time synchronization with **MongoDB Compass**.

---

## 🌟 Key Features

1. **Amazon & Flipkart Grade UI/UX**:
   - Sticky header with universal search across titles, brands, and categories.
   - Dynamic location indicator ("Deliver to Mumbai 400001").
   - Category navigation strip: *Electronics*, *Fashion*, *Home & Kitchen*, *Gaming*, *Today's Deals*.
   - Hero promotional banner slider for seasonal sales.
   - **Deal of the Day** ticker card with live countdown clock (`03h : 58m : 40s`).
   - 4-card quick category exploration grid.
   - Responsive multi-faceted catalog with filter sidebar (Category facets, Price range bounds, Star rating 4★+).
   - Commercial product cards with badges (`#1 Bestseller`, `Limited Deal`, `Nova's Choice`, `★ Top Rated`), star ratings, MRP strikethrough, discount percentages, and free delivery markers.

2. **Interactive Product Details & Variants**:
   - Full product detail modal with image thumbnail gallery switcher.
   - Multi-option variant selectors (e.g. Colors, Storage capacities, Shoe sizes).
   - Technical specifications table (Brand, Model, Battery, Connectivity, Warranty).
   - Verified customer reviews with star ratings and comments.
   - "Add to Cart" with fly-to-cart notifications and instant "Buy Now" checkout.

3. **Persistent Cart & Checkout System**:
   - Cart persisted via `localStorage` across page reloads.
   - Slide-out shopping cart drawer with quantity stepper (`+`, `-`, `Delete`).
   - Coupon discount engine: apply `SAVE10` for 10% instant off or `FESTIVE20` for 20% off.
   - Multi-step checkout form (Full Name, Phone, Email, Address, City, State, Pincode).
   - Multiple payment methods: Cash on Delivery (COD), UPI QR Code Demo, Credit/Debit Card.

4. **Live MongoDB Database & Compass Integration**:
   - Orders placed on the website are immediately written as documents to MongoDB in database `ecommerce_db` and collection `orders`.
   - Inventory stock is dynamically decremented in collection `products`.
   - Live **MongoDB Compass Inspector** drawer showing connection URI, document counts, and recent orders.
   - Order tracking page (`/tracking`) to query any order in real time.

---

## 🛠️ Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **GUI Database Client**: MongoDB Compass
- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom Properties & Flex/Grid), Vanilla JavaScript (Fetch API & LocalStorage)
- **Environment**: `dotenv` for configuration

---

## 🍃 MongoDB Compass Evaluation Guide (For Teachers / Evaluators)

Follow these steps to demonstrate real-time database execution in MongoDB Compass:

### Step 1: Open MongoDB Compass
1. Launch **MongoDB Compass** on your computer.
2. In the connection screen, enter:
   ```text
   mongodb://localhost:27017
   ```
3. Click **Connect**.

### Step 2: Inspect Database & Collections
1. In the left database panel, look for:
   ```text
   ecommerce_db
   ```
2. You will see three collections:
   - `products`: Contains 24 rich products with prices, ratings, and specifications.
   - `categories`: Contains the 4 main departments.
   - `orders`: Contains all customer orders.

### Step 3: Live Order Placement Demo
1. Open the website at `http://localhost:3000`.
2. Add any product (e.g. *Sony WH-1000XM5 Headphones* or *Nike Air Max Sneakers*) to your cart.
3. Open the cart drawer, enter coupon `SAVE10`, and click **Proceed to Checkout**.
4. Fill in demo customer details and click **Place Your Order**.
5. Note the generated Order ID (e.g. `ORD-2026-XXXXX`).
6. Switch to **MongoDB Compass**, click the `orders` collection, and press **Refresh**.
7. **The new order document appears instantly with full customer information, items purchased, and timestamps!**

---

## 🚀 Installation & Running

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Community Server & MongoDB Compass

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database (Populates 24 Products & Sample Orders)
```bash
npm run seed
```

### 4. Start the Application
```bash
npm start
```
The server will start at `http://localhost:3000` and automatically connect to MongoDB (`mongodb://127.0.0.1:27017/ecommerce_db`).

Alternatively on Windows, double click `start-website.bat`!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve products with filtering (`category`, `search`, `minPrice`, `maxPrice`, `minRating`, `sort`) |
| `GET` | `/api/products/:idOrSlug` | Retrieve product details by MongoDB ID or slug |
| `GET` | `/api/products/deals/featured` | Retrieve deals of the day and bestsellers |
| `POST` | `/api/products/:id/reviews` | Submit a customer review and recalculate rating |
| `GET` | `/api/categories` | Retrieve all categories with live product count |
| `POST` | `/api/orders` | Place a customer order & save document to MongoDB |
| `GET` | `/api/orders/:orderNumber` | Lookup order details and live tracking stepper |
| `GET` | `/api/orders` | Admin endpoint to list recent orders |
| `GET` | `/api/system/db-status` | Real-time database connection state & Compass metrics |

---

## 📁 Project Structure

```text
plain-walls/
├── server.js                  # Primary Express application & Compass status routes
├── .env                       # MongoDB URI (mongodb://127.0.0.1:27017/ecommerce_db)
├── .env.example               # Template environment configuration
├── package.json               # Project metadata & npm scripts
├── start-website.bat          # 1-click launcher for Windows
├── config/
│   └── db.js                  # Resilient Mongoose connection helper
├── models/
│   ├── Product.js             # Mongoose schema for products, specs & reviews
│   ├── Order.js               # Mongoose schema for customer orders & tracking
│   └── Category.js            # Mongoose schema for departments
├── controllers/
│   ├── productController.js    # Multi-faceted search, filter & deals logic
│   └── orderController.js      # Order creation, inventory deduction & tracking
├── routes/
│   ├── products.js            # Express router for /api/products
│   ├── orders.js              # Express router for /api/orders
│   └── categories.js          # Express router for /api/categories
├── seed/
│   └── seedEcommerce.js       # Database seeder (24 products across 4 departments)
└── public/
    ├── index.html             # Amazon/Flipkart style store, modals & Compass inspector
    ├── order-tracking.html    # Dedicated package tracking page
    ├── css/
    │   └── ecommerce.css      # Commercial e-commerce design system
    └── js/
        └── ecommerce.js       # Client reactive state, search, cart & Compass polling
```

---

## 🎓 Academic Presentation Tips

- **Show the database**: Highlight how `Product` has nested schemas for `specifications`, `variants`, and `reviews`.
- **Demonstrate transactions/atomic operations**: Point out how placing an order updates both the `orders` collection and decrements the `stock` in `Product` via `$inc: { stock: -quantity }`.
- **Use the in-app Compass Inspector**: Click the green `MongoDB: Connected` pill in the header during the demo to show your evaluator the exact connection string and live document counter!
