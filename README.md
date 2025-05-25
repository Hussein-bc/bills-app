# Invoice Manager App

A full-stack web application to manage recurring monthly invoices. Authenticated users can securely create invoice profiles, set payment due dates, upload related documents, and receive reminder notifications.

## Features

- User authentication via email (powered by Supabase)
- Create and edit invoice profiles with:
  - Payment day settings
  - Custom reminder schedules
- Upload PDF/image files per invoice per month/year
- Prevents duplicate uploads per month
- Browse and manage uploaded documents in a calendar-style view
- Responsive and modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js** (React Framework)
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Supabase** (PostgreSQL + Authentication + Storage)
- **Row-Level Security (RLS)** for secure per-user data access
- **Supabase Policies** for file access control and upload validation

## Database Schema Highlights

- Users table (managed by Supabase Auth)
- Invoices table (with metadata: name, due day, reminder settings)
- Uploads table (linked to invoices with month/year fields)
- RLS to restrict all data per authenticated user

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

