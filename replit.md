# SheBalance - Store Management Platform

## Overview

SheBalance is a comprehensive Progressive Web Application (PWA) designed to empower women entrepreneurs in Nigeria with digital tools for managing their businesses. The platform provides inventory management, sales tracking, financial record keeping, savings plans, loan management, and agent-based growth features. Built with React, TypeScript, and Supabase, the application supports offline functionality and push notifications to serve users in various connectivity environments.

## Migration Status

✅ **Successfully migrated from Lovable to Replit** (November 11, 2025)

### Migration Changes
- **Project Structure**: Reorganized to Replit fullstack template structure
  - Frontend code moved to `client/src/`
  - Public assets moved to `client/public/`
  - Added `server/` directory for future backend extensions
- **Build Configuration**: Updated Vite, TypeScript, and Tailwind configs for new structure
- **Package Management**: Using npm with Node.js 20
- **Development Server**: Vite dev server running on port 5000

### Required Setup

**IMPORTANT**: You need to configure your environment variables before the application will work.

1. Create a `.env` file in the root directory (use `.env.example` as a template)
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_PROJECT_URL=your_supabase_project_url
   VITE_SUPABASE_API_KEY=your_supabase_anon_key
   ```
3. (Optional) Add Firebase credentials for push notifications
4. Restart the application workflow after adding environment variables

You can add environment variables using the Secrets tab in Replit, or by creating a `.env` file.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Context API for global state (Auth, Store, Subscription, Theme, Obscurity)
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **PWA**: Vite PWA plugin with service worker for offline support
- **Data Fetching**: TanStack Query (React Query) for server state management

**Key Architectural Decisions:**

1. **Progressive Web App (PWA)**
   - Enables installation on mobile devices for native-app experience
   - Service worker provides offline functionality and background sync
   - Push notifications via Firebase Cloud Messaging for user engagement
   - Manifest configuration for app branding and display modes

2. **Context-Based State Management**
   - `AuthContext`: Manages user authentication state and session
   - `StoreContext`: Handles active store selection and store-specific data
   - `SubscriptionContext`: Tracks user subscription status and plan details
   - `ThemeContext`: Controls light/dark/system theme preferences
   - `ObscurityContext`: Manages balance visibility preferences across sections
   - Chosen for simplicity over Redux given moderate state complexity

3. **Component Architecture**
   - Page-level components in `/pages` directory
   - Reusable UI components in `/components` directory
   - Shadcn/ui pattern for customizable, accessible component library
   - Modal dialogs for add/edit operations to maintain context
   - Protected routes enforce authentication requirements

4. **Multi-Store Support**
   - Users can create and manage multiple stores
   - Store selector in sidebar for quick switching
   - All data operations scoped to selected store
   - First-time users guided through store creation flow

5. **Offline-First Design**
   - React Query caching strategies for reduced network calls
   - Service worker caches static assets and API responses
   - Local storage fallbacks for critical user preferences
   - Pending sync indicators when offline

### Backend Architecture

**Technology Stack:**
- **Backend-as-a-Service**: Supabase (PostgreSQL database, Auth, Storage, Realtime)
- **Authentication**: Supabase Auth with email/password and OTP flows
- **Server**: Express.js for production static file serving
- **Push Notifications**: Firebase Admin SDK for server-side notification triggers

**Key Architectural Decisions:**

1. **Supabase as Primary Backend**
   - Provides managed PostgreSQL database with row-level security
   - Built-in authentication with session management
   - Real-time subscriptions for live data updates
   - File storage for product images and documents
   - Reduces backend infrastructure complexity

2. **Database Schema Design**
   - **Core Tables**: users, stores, products, sales, sale_items
   - **Financial Tables**: financial_records, savings_plans, savings_contributions, savings_withdrawals, loans, loan_repayments
   - **Location Tables**: locations (Nigerian states), markets (linked to locations)
   - **Support Tables**: notifications, help_categories, help_articles, referrals, earnings
   - **Admin Tables**: withdrawal_requests, push_notification_subscriptions
   - Foreign key relationships maintain data integrity
   - UUID primary keys for distributed scalability

3. **Row-Level Security (RLS)**
   - Database policies enforce user can only access their own data
   - Store-based isolation for multi-store scenarios
   - Admin users have elevated permissions for management features
   - Policies defined at database level for security enforcement

4. **Real-time Subscriptions**
   - Store changes trigger UI updates via Supabase channels
   - Notifications delivered in real-time to connected clients
   - Sales and inventory updates refresh dashboards automatically
   - Reduces need for manual refresh or polling

5. **Custom Hooks Pattern**
   - `/integrations/supabase/hooks` contains React Query wrappers
   - Encapsulates database operations with consistent error handling
   - Examples: `useProducts`, `useSales`, `useSavingsPlans`, `useLoans`
   - Automatic cache invalidation and refetch on mutations
   - Provides loading states and error states to components

### Authentication & Authorization

1. **Authentication Flow**
   - Email/password signup with email verification (OTP)
   - Magic link login support
   - Password reset via OTP verification
   - Session persistence with Supabase tokens
   - Admin authentication uses separate hardcoded credentials

2. **Authorization Levels**
   - Regular users: Full CRUD on their stores and data
   - Sales representatives: Limited to sales operations (future feature)
   - Agents: Can refer users and earn commissions
   - Admins: Access to admin dashboard for platform management

3. **Protected Routes**
   - `ProtectedRoute` component wraps authenticated pages
   - `AdminProtectedRoute` for admin-only dashboard
   - Automatic redirect to login on session expiration
   - Loading states during authentication checks

### Financial Features

1. **Savings Plans**
   - Target-based savings with configurable duration (daily, weekly, monthly, etc.)
   - Contribution tracking with history
   - Partial and full withdrawal options
   - Progress visualization with charts
   - Status management: active, paused, completed

2. **Loan Management**
   - Loan creation with borrower details and terms
   - Interest calculation (percentage or fixed amount)
   - Repayment frequency options (daily, weekly, monthly, etc.)
   - Repayment tracking with principal/interest breakdown
   - Loan status tracking: active, overdue, completed

3. **Financial Records**
   - Income and expense categorization
   - Date-based filtering and reporting
   - Integration with sales for automatic income recording
   - Summary calculations for net profit/loss

### Location & Market System

1. **Geographic Organization**
   - All 36 Nigerian states stored in `locations` table
   - Markets linked to specific locations via foreign keys
   - Stores associated with location and market for geographic filtering
   - Enables location-based features and reporting

2. **Data Structure**
   - `locations`: State-level geographic data
   - `markets`: Market-level data linked to locations
   - `stores`: Business entities linked to markets and locations
   - Supports future features like location-based search and analytics

## External Dependencies

### Third-Party Services

1. **Supabase**
   - PostgreSQL database hosting and management
   - Authentication service with JWT tokens
   - Real-time database subscriptions
   - File storage for images and documents
   - API endpoint: Configured via environment variables

2. **Firebase Cloud Messaging (FCM)**
   - Push notification delivery to web and mobile clients
   - Service worker integration for background notifications
   - Admin SDK for server-side notification triggers
   - Project ID: `mystore-6f6e0`
   - Service account authentication via JSON key file

3. **Paystack** (Legacy - Removed)
   - Previously used for subscription payments
   - Integration code remains but functionality disabled
   - Inline.js SDK for payment modal

4. **Mono.co**
   - Bank account linking for financial integrations
   - Connect.js SDK for account connection flow
   - Test environment configuration present

### UI & Component Libraries

1. **Radix UI**
   - Unstyled, accessible component primitives
   - Dialog, Dropdown, Select, Tabs, Toast components
   - Keyboard navigation and ARIA support

2. **Shadcn/ui**
   - Pre-styled Radix components with Tailwind
   - Customizable via `components.json` configuration
   - Components copied into project for full control

3. **Lucide React**
   - Icon library for UI elements
   - Tree-shakable for optimal bundle size

4. **Recharts**
   - Charting library for data visualization
   - Bar charts for sales overview
   - Pie charts for inventory distribution

### Development Tools

1. **TypeScript**
   - Type safety across application
   - Interface definitions in `/types` directory
   - Relaxed strictness for faster development

2. **ESLint & TypeScript ESLint**
   - Code quality enforcement
   - React-specific linting rules
   - Disabled unused variable warnings for development speed

3. **Tailwind CSS**
   - Utility-first styling approach
   - Custom theme extending default palette
   - PostCSS for processing
   - Typography plugin for rich text formatting

4. **Vite**
   - Fast HMR during development
   - Optimized production builds
   - PWA plugin for service worker generation
   - Component tagging plugin for development tools

### Key Integrations

1. **Notification System**
   - Firebase for push notifications
   - In-app notification center with real-time updates
   - Notification preferences per user
   - Device token management for targeted notifications

2. **Referral System**
   - User-specific referral codes
   - Agent commission tracking
   - Earnings management and withdrawal requests
   - Integration with user signup flow

3. **Admin Dashboard**
   - Separate authentication system
   - User, agent, store, and loan management
   - Help article creation and management
   - Location and market configuration

4. **Theme System**
   - Light, dark, and system theme options
   - CSS variables for dynamic theming
   - Persistent theme preference in localStorage
   - System preference detection