import type { Request, Response, NextFunction } from 'express';

/**
 * Example Middleware
 * 
 * This file demonstrates how to structure middleware for SheBalance.
 * Middleware functions process requests before they reach controllers.
 * 
 * CURRENT STATE: Not yet integrated - Supabase handles auth and security
 * FUTURE STATE: These middleware will replace Supabase auth and RLS
 * 
 * Migration path:
 * 1. Implement authentication middleware (verify JWT tokens)
 * 2. Implement authorization middleware (check user permissions)
 * 3. Add validation middleware (validate request data)
 * 4. Update routes to use these middleware
 */

/**
 * Example: Authentication Middleware
 * Verifies user is authenticated and attaches user info to request
 * 
 * Current: Supabase client handles auth automatically
 * Future: This middleware will verify JWT tokens and attach user to req.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No authentication token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Future implementation:
    // 1. Verify JWT token
    // 2. Extract user ID and other claims
    // 3. Optionally fetch full user data from database
    // 4. Attach to req.user
    
    // For now, just placeholder
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = { id: decoded.sub, ... };

    // Mock user for example purposes
    (req as any).user = {
      id: 'example-user-id',
      email: 'user@example.com',
    };

    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

/**
 * Example: Authorization Middleware Factory
 * Checks if user has required role
 * 
 * Current: Supabase RLS policies handle authorization
 * Future: This middleware will check user roles and permissions
 */
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    // Future implementation:
    // Check if user has the required role
    // if (user.role !== requiredRole) {
    //   return res.status(403).json({ error: 'Insufficient permissions' });
    // }

    next();
  };
};

/**
 * Example: Store Access Middleware
 * Verifies user has access to the specified store
 * 
 * Current: Supabase RLS checks store ownership
 * Future: This middleware will verify store access
 */
export const requireStoreAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    const storeId = req.params.storeId || req.body.store_id;

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!storeId) {
      return res.status(400).json({ 
        error: 'Store ID required' 
      });
    }

    // Future implementation:
    // 1. Check if user owns the store or has access to it
    // 2. Check if user is a member/collaborator
    // const hasAccess = await checkStoreAccess(user.id, storeId);
    // if (!hasAccess) {
    //   return res.status(403).json({ error: 'No access to this store' });
    // }

    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to verify store access' 
    });
  }
};

/**
 * Example: Request Validation Middleware Factory
 * Validates request body against a schema
 * 
 * Can be used with Zod, Joi, or other validation libraries
 */
export const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Future implementation with Zod:
      // const result = schema.safeParse(req.body);
      // if (!result.success) {
      //   return res.status(400).json({
      //     error: 'Validation failed',
      //     details: result.error.errors
      //   });
      // }
      // req.body = result.data; // Use validated & transformed data

      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Invalid request data' 
      });
    }
  };
};

/**
 * Example: Error Handler Middleware
 * Catches errors from routes and controllers
 * Should be registered last in the middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Different error types
  if (err.message.includes('not found')) {
    return res.status(404).json({ 
      error: err.message 
    });
  }

  if (err.message.includes('Unauthorized')) {
    return res.status(403).json({ 
      error: err.message 
    });
  }

  if (err.message.includes('Invalid')) {
    return res.status(400).json({ 
      error: err.message 
    });
  }

  // Generic error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Example: Request Logger Middleware
 * Logs all incoming requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

/**
 * Notes for future implementation:
 * 
 * 1. JWT Authentication:
 *    - Use jsonwebtoken library
 *    - Verify tokens with public key
 *    - Handle token expiry and refresh
 * 
 * 2. Role-based Access Control (RBAC):
 *    - Define user roles (admin, user, store_manager, etc.)
 *    - Create permission matrix
 *    - Implement flexible authorization checks
 * 
 * 3. Validation:
 *    - Use Zod for runtime type validation
 *    - Create reusable schemas for common data types
 *    - Validate params, query, body, and headers
 * 
 * 4. Rate Limiting:
 *    - Use express-rate-limit
 *    - Different limits for different endpoints
 *    - Consider Redis for distributed rate limiting
 * 
 * 5. CORS:
 *    - Configure allowed origins
 *    - Handle preflight requests
 *    - Set appropriate headers
 */
