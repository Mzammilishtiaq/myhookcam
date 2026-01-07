# Video Timeline Portal

## Overview

A construction site video monitoring and review platform that allows users to view live streams, browse recorded video clips organized by date and time, add notes and flags to specific moments, share clips via email/SMS, and track IoT device status. The application features a timeline-based interface for navigating 5-minute video segments stored in AWS S3.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: 
  - TanStack React Query for server state and caching
  - Zustand for client-side UI state (sidebar toggle)
  - React Context for selection state and page titles
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON endpoints under `/api/`
- **Build**: esbuild for production bundling

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver
- **ORM**: Drizzle ORM with Zod schema validation
- **Video Storage**: AWS S3 with presigned URLs for secure access
- **Schema Location**: `shared/schema.ts` (shared between client and server)

### Key Data Models
- Users, Annotations (legacy), Bookmarks (legacy)
- NotesFlags (combined notes and bookmarks with flag indicator)
- Shares (for clip sharing via email/SMS)
- Devices, DeviceStatus, DeviceRuntimes (IoT monitoring)
- Clips (video segments with start/end times)
- Weather data (daily and hourly)

### External Service Integration Pattern
- Mock implementations for email (SendGrid) and SMS in development
- Services log to console instead of sending actual messages
- AWS S3 integration for video clip storage and retrieval

## External Dependencies

### Cloud Services
- **AWS S3**: Video clip storage with presigned URL generation
  - Requires: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`
- **Neon Database**: Serverless PostgreSQL
  - Requires: `DATABASE_URL`

### Email/SMS (Mocked)
- **SendGrid**: Email sending (currently mocked, logs to console)
- **SMS**: Mock implementation for clip sharing

### Frontend Libraries
- Radix UI primitives for accessible components
- Recharts for data visualization
- date-fns for date manipulation
- html2canvas and jsPDF for PDF export
- file-saver for client-side file downloads

### Development Tools
- Drizzle Kit for database migrations (`npm run db:push`)
- TypeScript for type safety across client and server