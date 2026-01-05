# Restaurant Ordering System

A complete restaurant ordering system backend built with Express.js, PostgreSQL, and TypeORM using TypeScript. This project includes user management, restaurant management, menu management, and order processing with real-time updates.

## Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO
- **File Uploads**: Multer
- **Validation**: Joi
- **Rate Limiting**: express-rate-limit
- **Containerization**: Docker & docker-compose

## Features

- User registration and login with role-based access (Admin, Restaurant Owner, Customer)
- Restaurant CRUD operations with image uploads
- Menu management with images
- Complete order flow with real-time status updates
- Redis caching for better performance
- Rate limiting for API protection
- Docker support for easy deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and configure)
4. Start the services:
   ```bash
   # Using Docker (recommended):
   docker-compose up --build
   
   # Or manually:
   npm run build
   npm start
   # or for development:
   npm run dev
   ```

## Environment Variables

Copy `.env.example` to `.env` and configure the variables:

- `PORT` - Server port (default: 3000)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL settings
- `JWT_SECRET`, `REFRESH_JWT_SECRET` - JWT configuration
- `REDIS_HOST`, `REDIS_PORT` - Redis settings
- Other upload and security settings

## API Endpoints

Check the included Postman collection in `docs/restaurant-ordering-system.postman_collection.json` for all endpoints.

Key endpoints include:

- Authentication: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Restaurants: `/api/restaurants` (CRUD operations)
- Menu: `/api/menu/restaurant/:restaurantId`, `/api/menu` (CRUD operations)
- Orders: `/api/orders` (create, read, update status)

## Running with Docker

```bash
docker-compose up --build
```

This starts the app, PostgreSQL, and Redis containers with proper configuration.

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── database/        # Database setup
├── middlewares/     # Auth, validation, rate limiting
├── models/          # Database entities
├── routes/          # API routes
├── services/        # Business logic
├── types/           # Type definitions
└── utils/           # Helper functions
```

## Development

Use `npm run dev` for development with auto-restart. The project uses TypeScript and follows a clean architecture pattern.

## Production

Build with `npm run build` and start with `npm start`. Make sure to set `NODE_ENV=production` and configure production environment variables properly.