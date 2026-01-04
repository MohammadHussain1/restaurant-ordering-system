# Restaurant Ordering System

A complete restaurant ordering system backend built with Express.js, PostgreSQL, and TypeORM using TypeScript.

## Features

- **User Management**: Registration, login, and role-based access control
- **Restaurant Management**: Create, update, and manage restaurants with image uploads
- **Menu Management**: Add, update, and manage menu items with image uploads
- **Order Management**: Place and track orders with real-time updates
- **Payment Simulation**: Simulated payment processing with success/failure
- **Real-time Updates**: Socket.IO integration for live order status updates
- **Caching**: Redis integration for menu caching
- **Rate Limiting**: Protection against API abuse
- **File Uploads**: Local image storage for restaurants and menu items
- **Docker Support**: Containerized setup for easy deployment

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

## Roles

- **Admin**: Full system access
- **Restaurant Owner**: Manage restaurant, menu, orders
- **Customer**: Browse menu, place orders

## Project Structure

```
src/
├── config/            # DB, Redis, env config
├── database/          # TypeORM datasource
├── models/            # TypeORM entities
├── repositories/      # DB queries
├── services/          # Business logic
├── controllers/       # Request/response handling
├── routes/            # Express routes
├── middlewares/       # Auth, role, rate limit
├── validators/        # Request validation
├── sockets/           # Socket.IO logic
├── types/             # Type definitions
├── utils/             # helpers, redis wrapper
├── errors/            # Custom errors
├── app.ts             # Express app config
└── server.ts          # Server bootstrap
uploads/
├── menu/              # Local image storage for menu items
└── restaurants/       # Local image storage for restaurants
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=restaurant_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h
REFRESH_JWT_SECRET=your_refresh_jwt_secret_key_here
REFRESH_JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Upload Configuration
MAX_FILE_SIZE=2097152 # 2MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/png
UPLOAD_PATH=./uploads

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see above)
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

## Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

## API Documentation

The Postman collection is available in `docs/restaurant-ordering-system.postman_collection.json`.
Import this file into Postman to test all API endpoints.

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get authenticated user's profile

#### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create a new restaurant (auth required, form-data with image upload)
- `PUT /api/restaurants/:id` - Update restaurant (auth required, form-data with optional image upload)
- `DELETE /api/restaurants/:id` - Delete restaurant (auth required)

#### Menu
- `GET /api/menu/restaurant/:restaurantId` - Get menu by restaurant ID
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Create menu item (auth required, form-data with image upload)
- `PUT /api/menu/:id` - Update menu item (auth required, form-data with optional image upload)
- `DELETE /api/menu/:id` - Delete menu item (auth required)

#### Orders
- `POST /api/orders` - Create a new order (auth required)
- `GET /api/orders` - Get customer's orders (auth required)
- `GET /api/orders/:id` - Get order by ID (auth required)
- `GET /api/orders/restaurant/:restaurantId` - Get restaurant's orders (auth required)
- `PUT /api/orders/:id/status` - Update order status (auth required)

## Postman Collection Usage

1. Import the collection file (`docs/restaurant-ordering-system.postman_collection.json`) into Postman
2. Import the environment file (`docs/restaurant-ordering-system.postman_environment.json`)
3. Set the `baseUrl` variable to your server URL (default: `http://localhost:3000`)
4. Use the "Register User" endpoint to create an account
5. Use the "Login User" endpoint to get access tokens
6. Set the `accessToken` variable in the environment with the returned token
7. Use the token in the "Authorization" header for protected endpoints

For endpoints that require image uploads:
- Use "form-data" in the request body
- Add text fields as key-value pairs
- Add image files with key "image" and select the file

## Error Handling

All API errors follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "details": {}
}
```

## Caching

Menu endpoints are cached in Redis for 10 minutes. Cache is automatically invalidated when menu items are updated or deleted.

## Socket.IO Events

- `joinRestaurantRoom`: Join restaurant-specific room
- `joinOrderRoom`: Join order-specific room for customers
- `orderCreated`: Emitted when a new order is created
- `orderStatusUpdated`: Emitted when order status changes

## Running Tests

```bash
npm test
```

## Development

For development, use:

```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

## Production

For production deployment:

1. Build the project: `npm run build`
2. Set `NODE_ENV=production` in your environment
3. Start the server: `npm start`

## API Response Format

All successful API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

## File Uploads

The system supports image uploads for both restaurants and menu items:
- Restaurant images are stored in `uploads/restaurants/`
- Menu item images are stored in `uploads/menu/`
- File types: JPEG and PNG only
- Maximum file size: 2MB
- The image path is stored in the database and can be accessed via the API

## Utility Functions

The project includes the following utility functions:

- `addMinutes(date: Date, minutes: number): Date` - Add minutes to a date
- `safeParse<T>(str: string): T | null` - Safely parse JSON string
- Custom `AppError` class for consistent error handling
- Redis JSON wrapper methods (`setJSON`, `getJSON`)

## Type Definitions

All application enums are centralized in `src/types/enums.ts`:

- `UserRole`: ADMIN, RESTAURANT_OWNER, CUSTOMER
- `MenuItemCategory`: APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE, SIDE
- `OrderStatus`: PENDING, PREPARING, READY, DELIVERED, CANCELLED
- `PaymentStatus`: PENDING, SUCCESS, FAILED