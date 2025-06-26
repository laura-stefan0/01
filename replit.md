# Corteo - Protest Organization Platform

## Overview

Corteo is a full-stack web application for discovering and organizing protests and activism events. Built with a modern React frontend and Express.js backend, the platform enables users to find nearby protests, explore featured events, and filter by categories like Climate, Pride, Workers' Rights, Justice, Environment, and Education.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color scheme for activist branding
- **Build Tool**: Vite for development and production builds
- **Mobile-First**: Bottom navigation pattern optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Data Layer**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with tsx for TypeScript execution

### Database Schema
- **Protests Table**: Core entity storing event details, location coordinates, categories, and metadata
- **Users Table**: User authentication and preference management
- **Schema Validation**: Zod schemas for runtime type safety and API validation

## Key Components

### Data Models
- **Protests**: Title, description, category, location (lat/lng), date/time, attendees, featured flag
- **Users**: Authentication credentials, preferences (notifications, location sharing, email settings)
- **Categories**: Pride, Climate, Workers, Justice, Environment, Education

### Frontend Components
- **ProtestCard**: Reusable component with featured and compact variants (now clickable)
- **ProtestDetail**: Full-page event details with share functionality and action buttons
- **MapView**: Interactive map using Leaflet with custom category-based markers
- **BottomNavigation**: Mobile-optimized tab navigation
- **UI Components**: Complete shadcn/ui component library implementation

### API Endpoints
- `GET /api/protests` - All protests
- `GET /api/protests/featured` - Featured protests
- `GET /api/protests/nearby` - Location-based protests
- `GET /api/protests/:id` - Single protest details by ID
- `GET /api/protests/category/:category` - Category filtering
- `GET /api/protests/search?q=query` - Text search functionality
- `GET /api/user/profile` - Current user profile information

## Data Flow

1. **Client Request**: Frontend makes API calls using TanStack Query
2. **Route Handling**: Express routes process requests and validate parameters
3. **Data Access**: Storage layer (currently in-memory, designed for database integration)
4. **Response**: JSON data returned to client with proper error handling
5. **State Management**: React Query handles caching, background updates, and loading states
6. **UI Updates**: Components re-render based on query state changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL client for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **leaflet**: Interactive maps (via react-leaflet)

### Development Tools
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Dev Server**: Runs on port 5000 with Vite middleware
- **Hot Reload**: Full-stack hot reload with Vite HMR
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `npm run db:push`
4. **Deployment**: Autoscale deployment target on Replit

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

## Recent Changes  
- June 26, 2025: Successfully completed migration from Replit Agent to standard Replit environment with full functionality
- June 26, 2025: Updated "What's new" cards to display only images without titles, timestamps, or dark overlays for cleaner visual presentation
- June 26, 2025: Implemented country-based filtering for "What's new" section using user's country_code field from profile
- June 26, 2025: Verified whats_new table is fully editable in Supabase with insert, update, and delete permissions working
- June 26, 2025: Added sample news data for multiple countries (IT, US, UK) to demonstrate country filtering functionality
- June 26, 2025: Updated Resources page to show only 3 essential items: Know Your Rights, Safety Tips, Emergency Contacts
- June 26, 2025: Removed "For Organizers" section from Resources tab in home page as requested by user
- June 26, 2025: Renamed Supabase "resources" table to "safety-tips" and updated all API endpoints and references
- June 26, 2025: Updated database schema, hooks, and route files to use SafetyTip types instead of Resource types
- June 26, 2025: Simplified Resources page to show only 3 essential items: Know Your Rights, Safety Tips, Emergency Contacts
- June 26, 2025: Fixed app startup by resolving syntax errors in home.tsx and resources.tsx components
- June 26, 2025: Implemented comprehensive country-based filtering system for protests, resources, and laws
- June 26, 2025: Added country_code fields to all database tables (users, protests, resources, laws)
- June 26, 2025: Updated all API endpoints to filter data by user's country (defaulting to IT)
- June 26, 2025: Created new API routes for resources and laws with country filtering
- June 26, 2025: Fixed navigation bar movement when selecting country/language dropdowns
- June 26, 2025: Updated Transparency page with streamlined content and moderation policies
- June 26, 2025: Set Profile page to show only Country: Italy and Language: English
- June 26, 2025: Added Transparency page in Profile section explaining Corteo's mission, values, and "why" with dedicated route
- June 26, 2025: Implemented DD-MM-YYYY date format and 24-hour time format throughout application with utility functions
- June 26, 2025: Restructured Resources page with "For Protesters" and "For Organizers" containers as requested
- June 26, 2025: Fixed React hooks violation by restructuring conditional rendering in Home component
- June 26, 2025: Successfully completed migration from Replit Agent to standard Replit environment
- June 26, 2025: Added soft fade transitions between screens using Tailwind animate-in classes
- June 26, 2025: Updated active navigation icon color to brand color #e40000 for better brand consistency
- June 26, 2025: Standardized database field naming to use image_url consistently throughout system
- June 26, 2025: Implemented fully automated image system linking Supabase storage to protests database
- June 26, 2025: Fixed image display issues and created comprehensive protest-images bucket integration
- June 26, 2025: Enhanced image handling system for proper Supabase storage integration and fallback support
- June 26, 2025: Successfully migrated project from Replit Agent to standard Replit environment
- June 26, 2025: Updated "For you" page: removed searchbar, renamed "News" to "What's new", made cards narrower, changed "Featured Protests" to "Featured", changed "Support the Movement" to "Support Us"
- June 26, 2025: Added Filter button to Search page that opens dedicated filter page with cause, date, and organizer filtering options
- June 26, 2025: Added "Edit profile" button to Profile page for authenticated users
- June 26, 2025: Updated user profile to show Jane/@janedoe with professional profile picture from Unsplash
- June 26, 2025: Added "Create New Protest" button in Profile page settings that opens form to create protests in Supabase database
- June 26, 2025: Enhanced protest creation form with photo upload capability and image preview functionality
- June 26, 2025: Added multer-based image upload API endpoint with file validation and storage handling

- June 26, 2025: Fixed Profile page sign-out button to be red and properly redirect to sign-in page
- June 26, 2025: Redesigned Profile page user section with centered layout, profile picture, location, and description
- June 26, 2025: Made News section horizontally scrollable with simplified cards showing only title and timestamp
- June 26, 2025: Enhanced "For you" page with improved header greeting logic for authenticated vs guest users
- June 26, 2025: Removed all card shadows and hover effects throughout the application
- June 26, 2025: Removed filter buttons from "For you" page for cleaner interface
- June 26, 2025: Added News section with smaller cards above Featured Protests section
- June 25, 2025: Fixed sign-out button to properly redirect authenticated users to sign-in page
- June 25, 2025: Replaced demo account login with guest access option
- June 25, 2025: Added "Use as guest" button with privacy message "No account needed. Corteo supports anonymity"
- June 25, 2025: Updated authentication flow to allow anonymous browsing without account requirements
- June 25, 2025: Successfully migrated project from Replit Agent to standard Replit environment
- June 25, 2025: Fixed duplicate export errors in database configuration files
- June 25, 2025: Enhanced HTML with proper SEO meta tags and Open Graph properties
- June 25, 2025: Verified all API endpoints are functioning correctly (protests, users, auth)
- June 25, 2025: Confirmed frontend loads properly with React/Vite development server
- June 25, 2025: Fixed startup error by migrating from PostgreSQL to Supabase database
- June 25, 2025: Updated all database connections to use Supabase client instead of Drizzle ORM
- June 25, 2025: Configured Supabase connection with provided credentials
- June 25, 2025: Updated user routes and database storage to work with Supabase REST API
- June 25, 2025: Application now starts successfully and connects to Supabase
- January 2025: Added mobile-responsive login/registration page with database integration
- January 2025: Created users table in Supabase and connected registration flow
- January 2025: Fixed authentication flow with wouter routing and resolved auth provider context issues
- January 2025: Added complete authentication system with sign-in screen, auth context, and protected routes
- January 2025: Added sign-out functionality to profile page with proper state management
- January 2025: Finalized database structure with /db in root and Express router pattern for API endpoints
- January 2025: Reorganized database structure into server/db/ and server/routes/ folders
- January 2025: Created dedicated user API endpoints with proper Supabase integration
- January 2025: Created database client with Drizzle ORM and updated server to use Supabase
- January 2025: Configured Supabase database connection with .env file and dotenv
- January 2025: Added personalized "Hi, {username}!" greeting in header for home page
- January 2025: Added user profile API endpoint and integrated user data display
- January 2025: Added clickable protest events with detailed view pages
- January 2025: Implemented back button navigation and native sharing functionality
- January 2025: Added "I'm Going" and "Get Directions" action buttons

## User Preferences

Preferred communication style: Simple, everyday language.