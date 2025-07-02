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
- July 2, 2025: Enhanced date extraction system to parse actual event dates from article content instead of publication dates - scrapers now analyze text for event scheduling language like "si terrà sabato 15 giugno" and "è previsto per il 20 luglio" with Italian date pattern recognition and validation
- July 2, 2025: Successfully completed migration from Replit Agent to standard Replit environment - enhanced scraper with precise geocoding system using OpenStreetMap Nominatim API to convert address + city combinations into exact coordinates for accurate map positioning instead of just city centers
- July 1, 2025: Implemented comprehensive event type system with database field and scraper integration - 📣 Protest, 🛠️ Workshop, 🧑‍🤝‍🧑 Assembly, 🎤 Talk, 🧭 Other with intelligent keyword detection in Italian and English for proper map icon display
- July 1, 2025: Removed all hover effects throughout the application - eliminated hover colors from Resources page cards, Profile menus, navigation items, notifications, theme settings, and other interface elements for consistent clean appearance
- July 1, 2025: Removed white hover effects from Profile page menu options - Settings, More, and App Theme menu items no longer show background color on hover
- July 1, 2025: Set default theme to light mode instead of system - app now loads with light theme by default for new users and initial loading
- July 1, 2025: Added new vertical "Warm" gradient background option (#f0edeb to #f7f6f5) to theme settings - users can now select from 4 gradient backgrounds (Sunset, Ocean, Forest, Warm)
- July 1, 2025: Fixed background images in theme settings - updated component to correctly detect and display the three background images (background1.png, background2.png, background3.png) in /public/backgrounds folder
- July 1, 2025: Removed all hover effects from back buttons in both light and dark themes - back buttons now have transparent backgrounds with no pink/grey highlight effects when hovered over
- July 1, 2025: Successfully completed migration from Replit Agent to standard Replit environment - all packages installed, application running properly with full functionality
- July 1, 2025: Updated light theme to new specifications - #F8F8F6 background, #FFFFFF cards, #1E293B primary text, #64748B secondary text, #E2E8F0 borders, #E11D48 accent/primary buttons, #DC2626 destructive, #94A3B8 inactive icons, #FECDD3/#E11D48 category labels
- July 1, 2025: Fixed filter page navigation hierarchy - back button and "Apply Filters" now correctly return to map page (/discover) instead of home page (/)
- July 1, 2025: Enhanced dark theme with comprehensive styling - fixed card borders (#121212), navigation bar background (#121212), map interface elements (#1F1F1F), and filter controls to match specified color scheme
- July 1, 2025: Removed 9 mainstream news sources from scraper configuration, keeping focused 8-source setup: 5 activism sites + 2 environmental + 1 alternative movement source
- July 1, 2025: Successfully completed migration from Replit Agent to standard Replit environment - all dependencies installed, working properly with full security implementation
- July 1, 2025: Fixed enhanced-italian-scraper.mjs to resolve database constraint issues with null time values, added default time of 18:00 for events without specific times
- July 1, 2025: Cleaned up scraper files by removing test and simple scraper variants, keeping only the enhanced scraper as the primary tool
- July 1, 2025: Fixed map filter menu functionality - updated filter logic to work with YYYY-MM-DD date format, made filter overlay always visible, and replaced outdated filters with "Upcoming", "Popular", and "Featured" filters
- July 1, 2025: Ran comprehensive scraper to refresh database with 19 authentic Italian protest events across 9 categories (LGBTQ+, Environment, Labor, Civil & Human Rights, Racial & Social Justice, Women's Rights, Healthcare & Education, Peace & Anti-War, Transparency & Anti-Corruption)
- July 1, 2025: Created new Italian protest scraper from scratch with advanced features - multi-source scraping from 11+ Italian activism websites, smart keyword filtering, duplicate detection, automatic geocoding, category classification, and comprehensive database integration
- July 1, 2025: Enhanced scraper title cleaning to remove dates/locations from titles and clean quote formatting - "15/07 Venezia - Assemblea" becomes "Assemblea", proper quote handling throughout
- July 1, 2025: Created comprehensive enhanced Italian protest scraper with pagination support, enhanced address extraction, proper time parsing without defaults, event URL extraction, deep content analysis from detail pages, and comprehensive logging system
- July 1, 2025: Added two new sources to web scraper - adlcobas.it (labor union activism) and notav.info (No TAV movement and territorial struggles) bringing total to 6 active sources
- July 1, 2025: Expanded web scraper with 11 major Italian news sources including Euronews, Il Fatto Quotidiano, Repubblica, Corriere della Sera, Fanpage, Il Sole 24 Ore, Globalist, Open, and Il Manifesto - bringing total to 17 active sources covering both activism websites and mainstream media
- July 1, 2025: Created notifications page with settings and mock notifications - bell icon now opens dedicated notifications page instead of profile
- July 1, 2025: Enhanced refresh location button to force clear location cache and get fresh GPS coordinates
- July 1, 2025: Removed preview section from App theme settings page for cleaner interface
- July 1, 2025: Updated App theme settings design - changed color selection from circles to rounded rectangles, combined colors/gradients/images into single scrollable row with hidden scrollbar using scrollbar-hide CSS class
- June 30, 2025: Created dedicated Profile page as standalone route with proper navigation structure - Profile is now a separate page accessible via /profile route with Settings, Actions, and Sign Out functionality
- June 30, 2025: Implemented complete theme system with global ThemeProvider context - background colors now apply across entire app with immediate saving to database when changed
- June 30, 2025: Updated theme settings page layout to match normal app pages like Transparency, removed "Save changes" button for immediate auto-save functionality
- June 30, 2025: Successfully migrated project from Replit Agent to standard Replit environment with full functionality maintained
- June 30, 2025: Enhanced manual location selection system to support both Italy and USA with proper distance-based sorting
- June 30, 2025: Added comprehensive US cities database with coordinates for accurate distance calculations  
- June 30, 2025: Fixed location system to use correct reference coordinates (manual location coordinates when selected, or real GPS coordinates as fallback)
- June 30, 2025: Updated geocoding system to support both Italian regions/cities and US states/cities structure
- June 29, 2025: Implemented comprehensive geolocation system using browser API and OpenStreetMap Nominatim reverse geocoding
- June 29, 2025: Created type-safe geolocation utility with caching, error handling, and automatic location detection
- June 29, 2025: Added real-time location display in two-row format with refresh button and loading states
- June 29, 2025: Updated "For you" page header to show only location selector in format "📍 Your location {location} ⌄" with clickable dropdown that navigates to profile settings
- June 29, 2025: Added user_location field to user schema to store city/state format locations like "Milan, IT" or "Los Angeles, CA"
- June 27, 2025: Successfully completed migration from Replit Agent to standard Replit environment - all dependencies installed, application running properly, database connected to Supabase
- June 27, 2025: Updated protest detail page description to maximum 700 characters with truncation
- June 27, 2025: Implemented comprehensive image management system with standard fallbacks - created centralized image utilities (client/src/lib/image-utils.ts) with category-specific high-quality Unsplash images, automatic error handling, and consistent image display across all components (protest cards, detail pages, maps)
- June 27, 2025: Implemented complete 10-category system with exact user specifications - updated all components to use Environment, LGBTQ+, Women's Rights, Labor, Racial & Social Justice, Civil & Human Rights, Healthcare & Education, Peace & Anti-War, Transparency & Anti-Corruption, Other with precise color coding (bg-green-600, bg-rose-500, bg-pink-700, bg-amber-600, bg-violet-700, bg-blue-600, bg-cyan-600, bg-sky-400, bg-gray-600, bg-indigo-600)
- June 27, 2025: Ran comprehensive scraper to reimport all Italian activism data - cleared existing events and added 15 new authentic events across standardized categories with real Italian organization names and locations
- June 27, 2025: Enhanced map with Airbnb-style design - removed zoom controls for mobile-first touch navigation, added GPS location button that centers map on user location with blue location marker, implemented full-screen map with floating overlay search controls and category legend
- June 27, 2025: Fixed protest image system - updated all 43 events with category-appropriate high-quality images and enhanced scrapers to automatically assign proper imagery for future events based on category (LGBTQ+, Environment, Labor, etc.)
- June 27, 2025: Updated all event categories from "LGBT+" to "LGBTQ+" standard - modified 13 existing events and updated scrapers to use consistent "LGBTQ+" labeling for all Pride-related events
- June 27, 2025: Fixed Ultima Generazione scraper data quality issues - deleted 31 incorrectly scraped events with dates as titles and generic locations, added 5 authentic climate activism events with proper dates and specific Italian city locations
- June 27, 2025: Fixed scraper date formatting to YYYY-MM-DD for proper database compatibility and enhanced validation
- June 27, 2025: Removed non-working Fridays For Future RSS feed and successfully scraped 156 total events from 3 major Italian activism organizations
- June 27, 2025: Created web scraper (run-scraper.js) to collect Italian Pride events from Arcigay and Pride websites, successfully populated 7 new events in Supabase protests table
- June 27, 2025: Fixed Resources navigation issue by removing standalone page and integrating into main app's tab system with 3-column grid layout
- June 27, 2025: Redesigned Resources page from list layout to 3-column clickable grid with fully interactive tiles (no buttons inside)
- June 27, 2025: Fixed Safety Tips navigation button on home page by updating link from "#" to "/safety-tips" 
- June 27, 2025: Successfully completed migration from Replit Agent to standard Replit environment
- June 27, 2025: Updated "Know Your Rights" page with Italy-specific protest rights information and replaced emojis with Lucide React icons
- June 27, 2025: Created comprehensive Safety Tips page with digital safety, checklists, and FAQs using consistent layout and different icons
- June 26, 2025: Successfully completed migration from Replit Agent to standard Replit environment with full functionality
- June 26, 2025: Updated "What's new" cards to display only images without titles, timestamps, or dark overlays for cleaner visual presentation
- June 26, 2025: Implemented and fixed country-based filtering for "What's new" section based on user's country selection in settings
- June 26, 2025: Fixed filtering logic to use selectedCountry from UI dropdown instead of hardcoded user profile country_code
- June 26, 2025: Verified whats_new table is fully editable in Supabase with insert, update, and delete permissions working
- June 26, 2025: Added sample news data for multiple countries (IT, US, UK) to demonstrate country filtering functionality
- June 26, 2025: Fixed blank space issue by filtering out items without valid images and hiding failed image cards
- June 26, 2025: Implemented clickable functionality for "What's new" cards using cta_url field from whats_new table
- June 26, 2025: Added support for text-based cards without images using gradient backgrounds and titles
- June 26, 2025: Created "Find protests in your area" card linking to /filter and "Know Your Rights in Italy" card linking to UNHCR website
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