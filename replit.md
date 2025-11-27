# SheBalance - Store Management Platform

## Overview

SheBalance is a comprehensive Progressive Web Application (PWA) designed to empower women entrepreneurs in Nigeria. It provides digital tools for managing businesses, including inventory management, sales tracking, financial record keeping, savings plans, and loan management. The platform also features agent-based growth functionalities. Built with React, TypeScript, and Supabase, SheBalance supports offline functionality and push notifications, catering to users in diverse connectivity environments. The vision is to be a leading digital enabler for small businesses in Nigeria, fostering financial independence and growth.

## User Preferences

Preferred communication style: Simple, everyday language.
Database Backend: Using Supabase ONLY (NOT PostgreSQL/Neon)
Multi-language support: English, Igbo, Yoruba, Hausa, Pidgin

## Recent Changes

**November 27, 2025 - Comprehensive Translation Updates**
- **Issue**: Multiple translation placeholders ([TRANSLATE]) remaining in language files and missing translations for key components like AddProductModal
- **Implementation**:
  - Updated `AddProductModal.tsx` with full i18n support using useTranslation hook
  - Replaced all hardcoded English strings with translation keys (`modals:addProduct.*`, `common:*`, `pages:inventory.*`)
  - Completed Yoruba (yo) translations: modals.json, common.json, pages.json
  - Completed Hausa (ha) translations: modals.json, common.json, pages.json
  - Completed Igbo (ig) translations: All modal sections (deleteNote, deleteSalesRep, logout, deleteProduct, deleteSale, deleteStore, withdrawal, addProduct, addSale, cart, financialRecord)
  - Completed Nigerian Pidgin translations: modals.json, common.json
  - Added missing inventory translation keys: productAddedSuccessfully, failedToAddProduct, purchasedPriceOptional, unitPriceOptional to all languages
  - Removed all [TRANSLATE] placeholders from translation files
- **Translation Quality**: Proper culturally appropriate translations for Nigerian languages:
  - Yoruba: Natural phrasing with proper diacritics (e.g., "Ẹ kú àbọ̀ sí SheBalance!")
  - Hausa: Proper Hausa dialect (e.g., "Barka da zuwa SheBalance!")
  - Igbo: Correct structure (e.g., "Nnọọ na SheBalance!")
  - Pidgin: Authentic Nigerian Pidgin (e.g., "Product don add well well")
- **Files Modified**: `AddProductModal.tsx`, and translation files across yo/, ha/, ig/, pidgin/ directories (modals.json, common.json, pages.json)
- **Impact**: Users now see fully translated content in their selected language across all app features

**November 23, 2025 - Translation System Fixes**
- **Issue**: Multiple UI elements across the application were displaying hardcoded English text instead of using translations, breaking the multi-language support for Igbo, Yoruba, Hausa, and Pidgin users
- **Root Cause**: Missing translation keys in language files and hardcoded strings in components
- **Implementation**:
  - Updated Sidebar component to use translation namespace keys (`sidebar.dashboard`, `sidebar.inventory`, `sidebar.sales`, `sidebar.finance`, `sidebar.settings`, `sidebar.notes`) instead of hardcoded strings
  - Added missing translation keys to all 5 language files (en, ig, yo, ha, pidgin) for:
    - Navigation sidebar items
    - Store selector (Active Store, Add New Store, Select Store)
    - Notification Settings (notification settings, enable push notifications, notifications enabled/disabled)
    - Sales actions (Add New Sale, Export Report, Filter Sales)
  - Removed all `[TRANSLATE]` placeholder text with proper localized translations
  - Fixed missing "addNewSale" translation key in Igbo and Yoruba pages.json files
  - Changed service worker `registerType` from "autoUpdate" to "prompt" in vite.config.ts to prevent automatic page reloads when service worker updates
- **User Experience**: 
  - All navigation menu items now display in the user's selected language
  - Store selector and notification settings properly translated
  - Sales page buttons (Add New Sale, Export Report, Filter Sales) display correctly in all languages
  - Service worker updates now prompt users instead of forcing automatic page reloads
- **Files Modified**: `client/src/components/sidebar/Sidebar.tsx`, `vite.config.ts`, `client/src/i18n/resources/*/navigation.json`, `client/src/i18n/resources/*/pages.json` (for all 5 languages)
- **Impact**: Multi-language support now works correctly across the entire application for all supported languages (English, Igbo, Yoruba, Hausa, Pidgin)

**November 21, 2025 - Navigation Flow Fixes**
- **Issue**: Clicking the SheBalance logo or reloading the page incorrectly redirected authenticated users to the login page instead of the dashboard
- **Root Cause**: LandingPageWrapper forced all returning visitors (even authenticated ones) to the login page; logo click always navigated to "/" which triggered the wrapper's redirect logic
- **Implementation**:
  - Updated TopBar logo to always navigate to "/landing" page
  - Modified LandingPageWrapper to check authentication state first and redirect authenticated users to dashboard with `replace: true` to prevent browser history pollution
  - Changed landing page logic to show landing for all logged-out visitors (not just first-time), allowing them to navigate to login naturally
  - Updated signOut function to clear "shebalance-has-visited" flag and redirect to "/" so users see landing page after logout
- **User Experience**: 
  - Logo click: Always takes user to landing page (for both logged-in and logged-out users)
  - Page reload at "/": Authenticated users → dashboard, logged-out users → landing page
  - After logout: Users see landing page on next visit
  - No redirect loops, no loading state flashing
- **Files Modified**: `client/src/components/TopBar.tsx`, `client/src/components/LandingPageWrapper.tsx`, `client/src/contexts/AuthContext.tsx`

**November 21, 2025 - Notification System Production Error Fix**
- **Issue**: Store notifications failed with "No users found for store" error
- **Root Cause**: The `sendNotificationToStore` function queried a `store_users` table that may not have records, causing all store notifications to fail
- **Solution**: Added fallback logic to query store owner from `stores` table when no `store_users` exist; improved error handling with `Promise.allSettled`
- **Impact**: Notifications now work reliably with graceful fallback to store owner
- **File Modified**: `client/src/lib/notificationHelper.ts`

**November 21, 2025 - WhatsApp-Style Push Notification System**
- **Feature**: Implemented comprehensive push notification system with Firebase Cloud Messaging
- **Implementation**:
  - Created NotificationDropdown component that displays notifications in a dropdown modal under the bell icon in TopBar
  - Integrated notification triggers into all major operations: sales (create/update/delete), products (create/update/delete/low stock alerts), loans (create/update/repayment), and savings (create/contribution)
  - Set up real-time notification subscription using Supabase real-time channels that shows toast notifications when new notifications arrive
  - Configured Firebase Admin SDK on server-side (`server/services/notification.service.ts`) to send push notifications
  - Added notification helper functions (`client/src/lib/notificationHelper.ts`) that trigger both in-app (Supabase) and push notifications (FCM)
  - Fixed React Rules of Hooks violations by ensuring `useNotificationSubscription` hook is called unconditionally
  - Implemented backdrop overlay and smooth animations for the notification dropdown
- **User Experience**: 
  - When app is open: Notifications appear in a dropdown modal under the bell icon with real-time toast alerts
  - When app is closed: Browser push notifications appear (via service worker and FCM)
  - Red badge on bell icon shows unread notification count
  - All user actions trigger notifications automatically
- **Architecture**: Dual notification system - Supabase for in-app notifications and Firebase Cloud Messaging for background push notifications

**November 20, 2025 - Production Deployment Configuration**
- **Changes**: Configured fullstack production deployment with separate frontend and backend build processes
- **Implementation**:
  - Created `tsconfig.server.json` for TypeScript compilation of server code to `dist/server/`
  - Updated `package.json` build scripts to compile both frontend (Vite) and backend (TypeScript) separately
  - Fixed server-side Supabase client in `server/db.ts` to create its own client instance instead of importing from client code
  - Updated `server/index.ts` to correctly serve the production build from `dist/`
  - Configured Replit deployment with "autoscale" target for automatic scaling
- **Build Process**: 
  - `npm run build` now runs three steps: (1) generate service worker, (2) build client with Vite to `dist/`, (3) compile server TypeScript to `dist/server/`
  - `npm start` runs the compiled server from `dist/server/index.js` which serves the frontend and provides API endpoints
- **Deployment**: Ready for production deployment via Replit's deploy button with automatic build and run configuration
- **Future Improvements**: Consider using Supabase service role key for server-side operations and adding Database type definitions to server code

**November 20, 2025 - React Query Offline Mode Improvements**
- **Issue**: React Query queries were not preserving cached data when offline, causing empty UI states and breaking optimistic updates
- **Root Cause**: Queries were attempting to refetch when offline and replacing cached data with empty results or error states
- **Solution**: Implemented correct React Query offline pattern using `placeholderData: (previousData) => previousData` combined with `networkMode: 'offlineFirst'`. This configuration allows queries to gracefully handle network failures by keeping previous data visible while the app is offline
- **Additional Fixes**: 
  - Removed security vulnerability (deleted unused file with hardcoded Supabase credentials)
  - Fixed database constraint error where financial records with 0 amount were rejected during sync
- **Impact**: Users now see cached data while offline, optimistic updates persist correctly, and all offline operations sync successfully when connectivity is restored

**November 19, 2025 - Offline UI Update Fix**
- **Issue**: When users performed offline actions (adding sales, products, financial records, etc.), the changes didn't appear in the UI until they reconnected to the internet
- **Root Cause**: Optimistic updates were being applied to React Query cache, but queries weren't being invalidated to notify components of the changes
- **Solution**: Modified `useOfflineMutation` hook to invalidate queries with `refetchType: 'none'` after applying optimistic updates. This triggers component re-renders without attempting to refetch from the server while offline
- **Impact**: All offline operations now show immediate UI feedback - users can see their added sales, products, loan repayments, savings contributions, and financial records instantly while offline

## System Architecture

### Frontend Architecture

SheBalance is built as a PWA using React 18+ with TypeScript, Vite, and React Router v6. State management is handled primarily via React Context API. The UI is constructed with Shadcn/ui components, based on Radix UI primitives, and styled using Tailwind CSS. Data fetching and server state management are powered by TanStack Query. The application supports multi-store management, with all data operations scoped to the selected store. 

**Offline-First Architecture:** The application implements a comprehensive offline-first design with:
- IndexedDB-based operation queuing system for all critical mutations (create, update, delete)
- Custom `useOfflineMutation` hook that automatically queues operations when offline and syncs when online
- **Optimistic UI updates with immediate re-rendering**: When users perform actions offline (adding sales, products, etc.), changes appear instantly in the UI through React Query cache updates and query invalidation with `refetchType: 'none'`
- Offline-aware toast messages that inform users when data is saved locally vs synced to the server
- Automatic background sync when connectivity is restored
- Service workers for asset caching and local storage for user preferences
- All major operations (sales, inventory, finance, loans, savings) work seamlessly offline with proper queuing and sync

### Backend Architecture

The core backend relies on Supabase, which provides a managed PostgreSQL database with Row-Level Security (RLS), authentication, real-time subscriptions, and file storage. Authentication uses Supabase Auth with email/password and OTP flows. The database schema includes core tables for users, stores, products, sales, and financial records, alongside tables for savings plans, loans, locations, and support. RLS policies enforce data isolation and security. Real-time features leverage Supabase channels for live data updates and notifications. Push notifications are managed via Firebase Cloud Messaging, with server-side triggers handled by the Firebase Admin SDK. Custom React Hooks encapsulate Supabase operations.

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
9.  **Vite**: Build tool for fast development and optimized production builds.