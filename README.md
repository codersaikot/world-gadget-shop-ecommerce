# 🌐 World Gadget Shop
### Full-Stack MERN E-Commerce Platform for Bangladesh

A production-ready online gadget store with complete user and admin functionality, built with the MERN stack and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install all dependencies at once
npm run install:all

# OR install manually:
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configure Environment

**Backend** — copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/world-gadget-shop
JWT_SECRET=your_super_secret_key_here_at_least_32_chars
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 👑 Admin: `admin@worldgadgetshop.com` / `Admin@12345`
- 👤 User: `user@test.com` / `User@12345`
- 8 sample products, 6 categories, 6 brands, 3 coupons

### 4. Start Development Servers

```bash
# Start both backend + frontend simultaneously
npm run dev
```

Or start separately:
```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

---

## 📁 Project Structure

```
world-gadget-shop/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── productController.js   # Product CRUD
│   │   ├── orderController.js     # Order management
│   │   └── miscControllers.js     # Cart, reviews, categories...
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verify + role guard
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Product.js             # Product schema
│   │   └── index.js               # All other models
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── brandRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── userRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   └── seeder.js              # Database seeder
│   ├── server.js                  # Entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx     # Top navigation
│   │   │   │   ├── Footer.jsx     # Site footer
│   │   │   │   ├── MainLayout.jsx # User layout wrapper
│   │   │   │   └── AdminLayout.jsx# Admin sidebar layout
│   │   │   └── common/
│   │   │       ├── ProductCard.jsx
│   │   │       ├── Spinner.jsx
│   │   │       ├── SkeletonCard.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── StarRating.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── OrderTrackingPage.jsx
│   │   │   ├── user/
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   └── MyOrdersPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminProductForm.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── AdminCategories.jsx
│   │   │       ├── AdminBrands.jsx
│   │   │       └── AdminCoupons.jsx
│   │   ├── store/
│   │   │   ├── index.js           # Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       └── otherSlices.js # Cart, Products, Orders, UI
│   │   ├── utils/
│   │   │   ├── api.js             # Axios instance
│   │   │   └── helpers.js         # Utility functions
│   │   ├── App.jsx                # Routes
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                   # Root scripts
└── README.md
```

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/profile` | Private |
| PUT | `/api/auth/change-password` | Private |
| POST | `/api/auth/address` | Private |
| POST | `/api/auth/wishlist/:productId` | Private |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/products/featured` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Cart
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cart` | Private |
| POST | `/api/cart/add` | Private |
| PUT | `/api/cart/update` | Private |
| DELETE | `/api/cart/remove/:productId` | Private |
| DELETE | `/api/cart/clear` | Private |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders` | Private |
| GET | `/api/orders/my` | Private |
| GET | `/api/orders/:id` | Private |
| GET | `/api/orders` | Admin |
| PATCH | `/api/orders/:id/status` | Admin |

---

## 🎨 Features

### User Side
- ✅ JWT Authentication (Register/Login/Profile)
- ✅ Product browsing with search, filter, sort, pagination
- ✅ Product details with image gallery & specifications
- ✅ Add to cart, update quantity, remove items
- ✅ Wishlist (add/remove)
- ✅ Multi-step checkout with coupon support
- ✅ COD + bKash + Nagad + Card payment options (mock)
- ✅ Order placement and tracking with status timeline
- ✅ Product reviews and star ratings
- ✅ Free shipping on orders above ৳1,000
- ✅ Bangladesh Taka (৳) currency

### Admin Panel
- ✅ Dashboard with revenue charts (Recharts)
- ✅ Product CRUD with bulk image URLs, specs, tags
- ✅ Toggle featured products
- ✅ Order management with status updates
- ✅ Customer management (activate/deactivate/promote)
- ✅ Category & Brand management
- ✅ Coupon system (percentage & fixed discounts, expiry)

---

## 🌐 Deployment Guide

### Backend → Railway / Render / VPS

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway add
railway deploy
```

Set environment variables in the Railway dashboard:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
FRONTEND_URL=https://your-frontend.vercel.app
```

**Render:**
1. Connect GitHub repo
2. New → Web Service
3. Build Command: `cd backend && npm install`
4. Start Command: `node server.js`
5. Add environment variables

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel
cd frontend
npm run build
vercel --prod
```

Or connect GitHub to Vercel dashboard:
1. Import project
2. Framework: Vite
3. Root Directory: `frontend`
4. Add env: `VITE_API_URL=https://your-backend.railway.app/api`

### MongoDB Atlas Setup
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Add database user
4. Whitelist IP (0.0.0.0/0 for all)
5. Get connection string → paste in `MONGO_URI`

---

## 🔧 Configuration for Production

### Update CORS in `backend/server.js`:
```js
origin: process.env.FRONTEND_URL
```

### Enable Cloudinary for real image uploads:
```env
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 🧪 Test Coupons

| Code | Discount | Min Order |
|------|----------|-----------|
| `WELCOME10` | 10% (max ৳500) | ৳1,000 |
| `FLAT500` | ৳500 flat | ৳5,000 |
| `GADGET20` | 20% (max ৳2,000) | ৳2,000 |

---

## 🚀 Future Enhancements

- [ ] AI product recommendations
- [ ] Real Stripe/bKash payment integration
- [ ] Multi-vendor support
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Product comparison
- [ ] Flash sales / countdown timers
- [ ] SMS order updates

---

## 📄 License

MIT — Free to use and modify for personal and commercial projects.

---

**Made with ❤️ in Bangladesh | World Gadget Shop © 2024**
