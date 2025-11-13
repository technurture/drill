# API Middleware

## Overview
Middleware functions process requests before they reach controllers. They handle cross-cutting concerns like authentication, validation, logging, and error handling.

## Common Middleware Types

### 1. Authentication
Verify user identity and attach user info to request:
```typescript
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify token and attach user to req.user
};
```

### 2. Authorization
Check if user has permission for the requested action:
```typescript
export const requireRole = (role: string) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

### 3. Validation
Validate request data against schemas:
```typescript
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  next();
};
```

### 4. Error Handling
Catch and format errors consistently:
```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};
```

### 5. Logging
Log requests for debugging and monitoring:
```typescript
export const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};
```

### 6. Rate Limiting
Prevent abuse by limiting requests:
```typescript
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Migration from Supabase

### Current State (Supabase)
- Authentication handled by Supabase Auth
- Row-level security (RLS) policies in database
- Built-in rate limiting and DDoS protection

### Future State (Custom Backend)
- Custom JWT authentication middleware
- Authorization checks in middleware/controllers
- Custom rate limiting
- CORS configuration
- Input validation

## Example Usage in Routes
```typescript
import { authMiddleware, validateBody } from '../middleware';
import { productSchema } from '../schemas';

router.post(
  '/products',
  authMiddleware,           // Verify user is logged in
  validateBody(productSchema), // Validate request body
  productController.create  // Handle the request
);
```

## Middleware Chain Order
The order matters! Typical chain:
1. CORS headers
2. Request logging
3. Rate limiting
4. Body parsing (express.json())
5. Authentication
6. Authorization
7. Validation
8. Controller
9. Error handling (last)

## Testing Middleware
Middleware should be unit tested:
```typescript
describe('authMiddleware', () => {
  it('should reject requests without token', async () => {
    // Test implementation
  });
  
  it('should attach user to request when token is valid', async () => {
    // Test implementation
  });
});
```
