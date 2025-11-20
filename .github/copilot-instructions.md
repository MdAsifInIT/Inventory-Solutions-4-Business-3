# Copilot Instructions for Inventory Solutions

## Architecture Overview

This is a **rental inventory management system** with three distinct applications:

- **Client**: React + Vite frontend (storefront + admin panel)
- **Server**: Express + MongoDB REST API
- **Mobile**: React Native + Expo app with QR scanning

Key architectural pattern: **Date-based inventory reservation system** using overlapping date range validation instead of simple stock counts.

## Critical Concepts

### Inventory Management

- `Product.totalStock`: Physical inventory count
- `Product.stock`: Real-time available stock (calculated field, not always used)
- `Reservation` model: Time-bound reservations (Active/Cancelled/Completed)
- `InventoryLedger`: Audit trail for stock changes (never delete entries)

**Stock validation pattern** (see `server/controllers/orderController.js`):

```javascript
// Always use MongoDB transactions for order creation
const overlappingReservations = await Reservation.find({
  product: productId,
  status: "Active",
  $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
});
const availableStock = product.totalStock - reservedQuantity;
```

### Authentication & Authorization

- **JWT tokens** stored in HTTP-only cookies (not localStorage)
- Three roles: `Admin`, `Staff`, `Viewer`
- Middleware: `protect` (authenticated) + `authorize(...roles)` (role-based)
- Client uses axios with `withCredentials: true` and `baseURL: 'http://localhost:5000'`

### Data Flow Patterns

**Order creation flow** (critical - uses transactions):

1. Validate stock availability against overlapping reservations
2. Create Order document
3. Create Reservation records for each item
4. All wrapped in MongoDB session transaction (see `orderController.createOrder`)

**Product updates with stock changes**:

- Always create `InventoryLedger` entry when `totalStock` changes
- Use `reason` enum: 'Initial Stock', 'Purchase', 'Rental Return', 'Rental Out', 'Damage', 'Correction', 'Lost'

## Development Workflows

### Running the project

```bash
# Install all workspaces
npm run install:all

# Run client + server concurrently
npm run dev

# Individual services
npm run dev --workspace=server  # Uses node --watch (Node 18+)
npm run dev --workspace=client  # Vite dev server on :5173
npm run start --workspace=mobile  # Expo
```

### Database seeding

```bash
cd server
node seeder.js  # Creates admin@example.com / staff@example.com / user@example.com (pw: password123)
```

### Production build

```bash
npm run build --workspace=client  # Outputs to client/dist
npm start --workspace=server  # Serves client/dist in production mode
```

## Key File Locations

- **Models**: `server/models/` - Mongoose schemas with pre-save hooks and virtuals
- **Routes**: `server/routes/` - All prefixed with `/api/`
- **Middleware**: `server/middleware/authMiddleware.js` - `protect` and `authorize` functions
- **Client Context**: `client/src/context/` - AuthContext (JWT cookies) + CartContext (localStorage)
- **Admin Pages**: `client/src/pages/admin/` - Protected by role-based routes in `App.jsx`

## Conventions

- **Error responses**: `{ success: false, error: 'message' }`
- **Success responses**: `{ success: true, data: {...} }`
- **Product slugs**: Auto-generated using `slugify` in pre-save hook
- **Pagination**: Use `?page=1&limit=10&sort=-createdAt` query params (see `productController.getProducts`)
- **Protected routes**: Wrap in `<ProtectedRoute roles={['Admin', 'Staff']}>` (client/src/App.jsx)

## Common Patterns

**Creating protected API endpoints**:

```javascript
router.post(
  "/endpoint",
  protect,
  authorize("Admin", "Staff"),
  controllerFunction
);
```

**Frontend authenticated requests** (axios auto-sends cookies):

```javascript
const { data } = await axios.get("/api/endpoint"); // baseURL set in AuthContext
```

**Adding new product fields**: Update both `Product` model schema AND any snapshots in `Order.items[]`

## Environment Variables

Required in `server/.env`:

- `MONGO_URI`, `JWT_SECRET`, `PORT` (default 5000)
- `CLIENT_URL` (CORS origin, default: http://localhost:5173)
- Payment: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (optional)
