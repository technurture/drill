# SheBalance - Store Management Platform

## Overview

SheBalance is a comprehensive Progressive Web Application (PWA) designed to empower women entrepreneurs in Nigeria. It provides digital tools for managing businesses, including inventory management, sales tracking, financial record keeping, savings plans, and loan management. The platform also features agent-based growth functionalities. Built with React, TypeScript, and Supabase, SheBalance supports offline functionality and push notifications, catering to users in diverse connectivity environments. The vision is to be a leading digital enabler for small businesses in Nigeria, fostering financial independence and growth.

## User Preferences

Preferred communication style: Simple, everyday language.
Database Backend: Using Supabase ONLY (NOT PostgreSQL/Neon)
Multi-language support: English, Igbo, Yoruba, Hausa, Pidgin

## Recent Changes

### Multi-Language Bug Fixes (November 17, 2025)
- **Translation Key Conflict Resolution**: Fixed duplicate "settings" key error that caused i18n to return objects instead of strings. Updated Sidebar.tsx to use "settings.title" and removed duplicate standalone "settings" keys from all 5 language files (en, yo, ig, ha, pidgin).
- **Language Preference Isolation**: Fixed critical bug where language preferences were shared across users. LanguageContext now properly isolates preferences per user by:
  - Initializing with DEFAULT_LANGUAGE instead of reading from shared localStorage
  - Explicitly resetting to DEFAULT_LANGUAGE when a user has no stored preference (preventing state leakage from previous users)
  - Applying isolation logic to both authenticated and guest user flows
- **User-Specific Storage**: Language preferences are now properly stored using user-specific localStorage keys (`shebalance-language-{userId}`) and Supabase user metadata, ensuring each user maintains their own language selection across sessions.

### Environment Variables Configuration (November 15, 2025)
- **Universal Environment Loading**: Configured Vite to load environment variables from root directory using `envDir` option.
- **Cross-Directory Access**: Environment variables are now accessible from anywhere in the codebase (root or client directories).
- **Documentation**: Created comprehensive `ENVIRONMENT_SETUP.md` guide with setup instructions and best practices.
- **Template File**: Enhanced `.env.example` with detailed comments and configuration notes.

### Vercel Deployment Configuration (November 15, 2025)
- **Build Output Directory**: Restructured build configuration to output to root `dist` directory instead of `client/dist` for Vercel compatibility.
- **Vercel Configuration**: Updated `vercel.json` with proper build command, output directory, and framework settings.
- **Package Scripts**: Simplified build script to use default Vite output configuration.
- **Successful Build Test**: Verified build process generates all required assets including PWA manifest, service worker, and bundled JavaScript/CSS.

### Offline Functionality Enhancements (November 14, 2025)

### Offline Functionality Enhancements
- **Toast Notifications for Offline Actions**: Users now receive clear feedback when performing actions while offline (creating savings plans, adding sales, etc.). A success toast appears confirming the action was saved locally and will sync when back online.
- **Implementation**: Enhanced `useOfflineMutation` hook with toast notifications that display for 5 seconds with a description encouraging users to reconnect for data sync.

### Navigation Improvements
- **Logo Navigation**: The SheBalance logo in the TopBar is now clickable and navigates users to the landing page ('/'), allowing authenticated users to return to the home page.
- **Dashboard Access on Landing**: Authenticated users visiting the landing page now see a "Dashboard" button instead of Login/Signup buttons, enabling quick access to their dashboard without re-authentication.
- **Seamless User Experience**: Changes apply to both the header navigation and all CTA buttons throughout the landing page.

## System Architecture

### Frontend Architecture

SheBalance is built as a PWA using React 18+ with TypeScript, Vite, and React Router v6. State management is handled primarily via React Context API for authentication, store selection, subscription status, theme, and balance visibility. The UI is constructed with Shadcn/ui components, based on Radix UI primitives, and styled using Tailwind CSS. Data fetching and server state management are powered by TanStack Query. The application supports multi-store management, allowing users to create and oversee multiple businesses, with all data operations scoped to the selected store. An offline-first design is implemented, utilizing service workers for asset caching, local storage for preferences, and pending sync indicators.

### Backend Architecture

The core backend relies on Supabase, which provides a managed PostgreSQL database with Row-Level Security (RLS), authentication, real-time subscriptions, and file storage. Authentication uses Supabase Auth with email/password and OTP flows. The database schema includes core tables for users, stores, products, sales, and financial records, alongside tables for savings plans, loans, locations, and support. RLS policies enforce data isolation and security. Real-time features leverage Supabase channels for live data updates and notifications. Push notifications are managed via Firebase Cloud Messaging, with server-side triggers handled by the Firebase Admin SDK. Custom React Hooks encapsulate Supabase operations for consistent data management and error handling.

### Financial Features

The platform offers robust financial tools including target-based Savings Plans with contribution tracking and withdrawal options, comprehensive Loan Management with interest calculation and repayment tracking, and detailed Financial Records for income/expense categorization and reporting.

### Location & Market System

The system integrates Nigerian geographic data, with all 36 states stored as `locations` and `markets` linked to specific locations. Stores are associated with these geographic entities, enabling location-based features and filtering.

## External Dependencies

1.  **Supabase**: Provides PostgreSQL database, authentication, real-time features, and storage.
2.  **Firebase Cloud Messaging (FCM)**: Used for push notification delivery to clients.
3.  **Mono.co**: Integrates for bank account linking via its Connect.js SDK.
4.  **Radix UI**: Provides unstyled, accessible component primitives.
5.  **Shadcn/ui**: A collection of pre-styled Radix components with Tailwind CSS.
6.  **Lucide React**: An icon library for UI elements.
7.  **Recharts**: Utilized for data visualization and charting.
8.  **TypeScript**: Ensures type safety across the application.
9.  **ESLint & TypeScript ESLint**: Enforces code quality.
10. **Tailwind CSS**: Utility-first styling framework.
11. **Vite**: Build tool for fast development and optimized production builds.