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
- **ProtestCard**: Reusable component with featured and compact variants
- **MapView**: Interactive map using Leaflet with custom category-based markers
- **BottomNavigation**: Mobile-optimized tab navigation
- **UI Components**: Complete shadcn/ui component library implementation

### API Endpoints
- `GET /api/protests` - All protests
- `GET /api/protests/featured` - Featured protests
- `GET /api/protests/nearby` - Location-based protests
- `GET /api/protests/category/:category` - Category filtering
- `GET /api/protests/search?q=query` - Text search functionality

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

## Changelog
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.