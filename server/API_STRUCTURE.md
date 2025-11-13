# Backend API Structure Documentation

## Overview

This document outlines the backend API structure for SheBalance. The current implementation uses **Supabase** as the primary backend, but this structure is designed to facilitate easy separation and migration to a custom backend in the future.

## Architecture

```
server/
├── index.ts              # Main server entry point
├── db.ts                 # Database connection (currently Neon/Postgres)
├── routes/               # API route definitions
│   └── *.routes.ts       # Route files organized by feature
├── controllers/          # Business logic handlers
│   └── *.controller.ts   # Controller files for each feature
└── middleware/           # Shared middleware functions
    └── *.middleware.ts   # Reusable middleware
```

## Design Principles

### 1. **Separation of Concerns**
- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle business logic and data processing
- **Middleware**: Provide reusable request processing (auth, validation, etc.)

### 2. **Supabase Integration Layer**
The current implementation uses Supabase for:
- Authentication (via `@supabase/supabase-js`)
- Database operations (Postgres via Supabase client)
- Real-time subscriptions
- Row-level security (RLS)

### 3. **Migration Path**
To migrate from Supabase to a custom backend:
1. Keep the route structure intact
2. Replace Supabase client calls in controllers with direct database queries
3. Implement custom authentication middleware
4. Replace Supabase RLS with custom authorization logic
5. Implement custom real-time features (WebSockets, Server-Sent Events)

## Current State vs Future State

### Current (Supabase-based)
```typescript
// Client-side direct Supabase calls
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', storeId);
```

### Future (API-based)
```typescript
// Client-side API calls
const response = await fetch('/api/products', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

## Key Components

### Routes (`server/routes/`)
- Define API endpoints
- Map HTTP methods to controller functions
- Apply middleware (authentication, validation)
- Example: `products.routes.ts`, `sales.routes.ts`, `auth.routes.ts`

### Controllers (`server/controllers/`)
- Contain business logic
- Process requests and format responses
- Interact with database (currently via Supabase, future: direct queries)
- Handle error cases
- Example: `products.controller.ts`, `sales.controller.ts`, `auth.controller.ts`

### Middleware (`server/middleware/`)
- Authentication/authorization
- Request validation
- Error handling
- Logging
- Rate limiting
- Example: `auth.middleware.ts`, `validate.middleware.ts`, `error.middleware.ts`

## Example Flow

### Current Supabase Flow
```
Client → Supabase Client Library → Supabase API → Database
```

### Future Custom Backend Flow
```
Client → Express Route → Middleware → Controller → Database
                ↓           ↓            ↓
            Logging    Auth/Validation  Business Logic
```

## Migration Checklist

When ready to migrate from Supabase:

### Phase 1: Setup
- [ ] Set up API routes structure
- [ ] Implement authentication middleware
- [ ] Create database connection pool
- [ ] Set up environment configuration

### Phase 2: Core Features
- [ ] Migrate authentication endpoints
- [ ] Migrate product/inventory endpoints
- [ ] Migrate sales endpoints
- [ ] Migrate user management endpoints

### Phase 3: Advanced Features
- [ ] Implement real-time features (if needed)
- [ ] Migrate file storage (replace Supabase Storage)
- [ ] Set up background jobs/cron tasks
- [ ] Implement email notifications

### Phase 4: Client Migration
- [ ] Update client code to use API endpoints
- [ ] Remove Supabase client library
- [ ] Update offline sync to work with new API
- [ ] Test all features thoroughly

## Database Schema
The database schema is currently managed through Supabase migrations. When migrating:
- Export the current schema
- Set up migration system (e.g., Drizzle, Prisma, or raw SQL migrations)
- Maintain the same table structure for compatibility

## Security Considerations

### Current (Supabase RLS)
- Row-level security policies in Supabase
- JWT-based authentication
- Built-in security features

### Future (Custom Backend)
- Implement custom authorization middleware
- Validate user permissions in controllers
- Use parameterized queries to prevent SQL injection
- Implement CSRF protection
- Set up rate limiting
- Use HTTPS for all API calls

## API Documentation
Once routes are implemented, use tools like:
- Swagger/OpenAPI for API documentation
- Postman collections for testing
- API versioning for backward compatibility

## Notes
- This structure is **forward-compatible** and doesn't break current Supabase integration
- All new features should follow this pattern
- The migration can be done gradually, feature by feature
- Keep both systems running during migration for rollback capability
