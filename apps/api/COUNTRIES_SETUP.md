# Countries Module Setup Guide

## Overview

The Countries module provides CRUD operations for managing countries in the movie catalog system. It includes a complete admin interface and API endpoints.

## Prerequisites

- Node.js 18+ (required for Prisma)
- PostgreSQL database
- Prisma CLI

## Current Status

⚠️ **The countries functionality is currently disabled** until the database migration is completed.

## Setup Steps

### 1. Update Node.js

The current Node.js version (v10.19.0) is too old for Prisma. Update to Node.js 18+:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

### 2. Run Database Migration

After updating Node.js, run the migration to create the countries tables:

```bash
cd apps/api

# Generate Prisma client with new schema
npx prisma generate

# Run the migration
npm run db:migrate
```

### 3. Enable Countries Functionality

Once the migration is complete, uncomment the methods in `src/modules/countries/countries.service.ts`:

```typescript
// Remove the throw statements and uncomment the actual implementation
async findAll(filters: {...}) {
  // Remove this line:
  // throw new Error("Countries functionality requires database migration. Please run the migration first.");

  // Uncomment the actual implementation below
  const { search, page = 1, limit = 20, sortBy = "name", sortOrder = "asc" } = filters;
  // ... rest of the method
}
```

### 4. Test the API

Start the API server:

```bash
npm run start:dev
```

Test the endpoints:

- `GET /v1/admin/countries` - List countries
- `POST /v1/admin/countries` - Create country
- `GET /v1/admin/countries/:id` - Get country by ID
- `PATCH /v1/admin/countries/:id` - Update country
- `DELETE /v1/admin/countries/:id` - Delete country

### 5. Test the Admin Interface

Start the admin frontend:

```bash
cd apps/admin
npm run dev
```

Navigate to the Countries section in the admin panel.

## Database Schema

The migration creates two tables:

### `countries` table

- `id` - Primary key (CUID)
- `name` - Country name in English
- `code` - ISO 3166-1 alpha-2 code (unique)
- `native_name` - Country name in native language
- `flag` - Flag emoji
- `flag_url` - Flag image URL
- `description` - Country description
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### `movie_countries` table

- `movie_id` - Reference to movies table
- `country_id` - Reference to countries table
- Composite primary key: `(movie_id, country_id)`

## Features

- **Full CRUD Operations**: Create, read, update, delete countries
- **Search & Filtering**: Search by name, code, or native name
- **Sorting**: Sort by name, code, creation date, or update date
- **Status Management**: Active/inactive country status
- **Visual Elements**: Support for flag emojis and flag image URLs
- **Form Validation**: Client-side and server-side validation
- **Permission-Based Access**: Role-based access control
- **Data Integrity**: Prevents deletion of countries used in movies

## API Endpoints

| Method | Endpoint                      | Description                    | Permission Required |
| ------ | ----------------------------- | ------------------------------ | ------------------- |
| GET    | `/admin/countries`            | List countries with pagination | `countries.view`    |
| GET    | `/admin/countries/popular`    | Get popular countries          | `countries.view`    |
| GET    | `/admin/countries/:id`        | Get country by ID              | `countries.view`    |
| GET    | `/admin/countries/code/:code` | Get country by ISO code        | `countries.view`    |
| POST   | `/admin/countries`            | Create new country             | `countries.create`  |
| PATCH  | `/admin/countries/:id`        | Update country                 | `countries.update`  |
| DELETE | `/admin/countries/:id`        | Delete country                 | `countries.delete`  |

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing `country` model:

1. Ensure the migration has been run
2. Regenerate the Prisma client: `npx prisma generate`
3. Restart the TypeScript compiler

### Database Connection Issues

- Check your `.env` file for correct `DATABASE_URL`
- Ensure PostgreSQL is running
- Verify database permissions

### Migration Issues

- Ensure you're using Node.js 18+
- Check that the Prisma schema is valid: `npx prisma validate`
- Try resetting the database: `npx prisma migrate reset` (⚠️ **WARNING**: This will delete all data)

## Next Steps

After completing the setup:

1. Test all CRUD operations
2. Add some sample countries
3. Integrate with the movie creation/editing forms
4. Test the permission system
5. Add any additional features specific to your needs

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify the database migration was successful
3. Ensure all dependencies are up to date
4. Check the Prisma documentation: https://www.prisma.io/docs/
