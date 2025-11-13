# API Controllers

## Overview
Controllers contain the business logic for handling API requests. They process data, interact with the database, and format responses.

## Structure
Each feature should have its own controller file:
- `products.controller.ts` - Product/inventory business logic
- `sales.controller.ts` - Sales transaction logic
- `stores.controller.ts` - Store management logic
- `auth.controller.ts` - Authentication logic
- `users.controller.ts` - User management logic

## Controller Responsibilities

### Data Processing
- Validate and sanitize input data
- Transform data between API and database formats
- Calculate derived values

### Database Interaction
- **Current**: Use Supabase client (server-side)
- **Future**: Use direct database queries via db.ts

### Response Formatting
- Structure responses consistently
- Handle errors gracefully
- Return appropriate HTTP status codes

### Business Rules
- Enforce business logic
- Check permissions
- Validate relationships between entities

## Example Controller Structure
```typescript
export const productController = {
  async getAll(userId: string) {
    // Business logic here
  },
  
  async getById(id: string, userId: string) {
    // Business logic here
  },
  
  async create(data: ProductData, userId: string) {
    // Business logic here
  },
  
  async update(id: string, data: Partial<ProductData>, userId: string) {
    // Business logic here
  },
  
  async delete(id: string, userId: string) {
    // Business logic here
  }
};
```

## Error Handling
Controllers should throw descriptive errors:
```typescript
if (!product) {
  throw new Error('Product not found');
}

if (product.user_id !== userId) {
  throw new Error('Unauthorized');
}
```

## Migration from Supabase
When migrating from Supabase to custom backend:

### Before (Direct Supabase)
```typescript
// Client-side
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('user_id', userId);
```

### After (Custom Controller)
```typescript
// Controller
export const productController = {
  async getAll(userId: string) {
    const products = await db
      .select()
      .from('products')
      .where('user_id', userId);
    return products;
  }
};
```

## Testing
Controllers should be unit tested:
- Test business logic separately from database
- Mock database calls
- Test error cases
- Verify data transformations
