# API Routes

## Overview
This directory contains API route definitions for SheBalance. Routes define the HTTP endpoints and map them to controller functions.

## Structure
Each feature should have its own route file:
- `products.routes.ts` - Product/inventory management
- `sales.routes.ts` - Sales transactions
- `stores.routes.ts` - Store management
- `auth.routes.ts` - Authentication and authorization
- `users.routes.ts` - User management
- `finance.routes.ts` - Financial records
- `savings.routes.ts` - Savings groups
- `loans.routes.ts` - Loan management

## Route Naming Conventions

### RESTful API Standards
- GET `/api/resource` - List all resources
- GET `/api/resource/:id` - Get single resource
- POST `/api/resource` - Create new resource
- PUT `/api/resource/:id` - Update entire resource
- PATCH `/api/resource/:id` - Update partial resource
- DELETE `/api/resource/:id` - Delete resource

### Example Route File
See `example.routes.ts` for a complete example.

## Middleware Usage
Routes should apply appropriate middleware:
```typescript
router.get('/protected', authMiddleware, controller.protectedRoute);
router.post('/create', authMiddleware, validateMiddleware, controller.create);
```

## Integration with Supabase
Currently, most data operations happen directly in the client via Supabase client library. As you add routes:
1. Keep the route definitions here
2. Controllers can initially call Supabase (server-side)
3. Later, replace Supabase calls with direct database queries

## Example Usage
```typescript
import express from 'express';
import productsRouter from './routes/products.routes';
import salesRouter from './routes/sales.routes';

const app = express();

// Register routes
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
```
