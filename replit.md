# SheBalance - Store Management Platform

## Overview

SheBalance is a comprehensive Progressive Web Application (PWA) designed to empower women entrepreneurs in Nigeria. It provides digital tools for managing businesses, including inventory management, sales tracking, financial record keeping, savings plans, and loan management. The platform also features agent-based growth functionalities. Built with React, TypeScript, and Supabase, SheBalance supports offline functionality and push notifications, catering to users in diverse connectivity environments. The vision is to be a leading digital enabler for small businesses in Nigeria, fostering financial independence and growth.

## User Preferences

Preferred communication style: Simple, everyday language.
Database Backend: Using Supabase ONLY (NOT PostgreSQL/Neon)
Multi-language support: English, Igbo, Yoruba, Hausa, Pidgin

## Recent Changes

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