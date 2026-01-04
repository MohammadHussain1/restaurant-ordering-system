# Restaurant Ordering System

This is a full-featured restaurant ordering system backend built with Express.js, PostgreSQL, and TypeORM using TypeScript. I built this as a complete example of a modern restaurant management platform with real-world features.

## What's Included

- **User Management**: User registration, login, and role-based access control
- **Restaurant Management**: Full CRUD for restaurants with image uploads
- **Menu Management**: Add and manage menu items with images
- **Order Management**: Complete order flow with real-time status updates
- **Payment Simulation**: Mock payment processing with success/failure scenarios
- **Real-time Updates**: Socket.IO for live order tracking
- **Caching**: Redis integration for better performance on menu endpoints
- **Rate Limiting**: Protection against API abuse
- **File Uploads**: Local storage for restaurant and menu images
- **Docker Support**: Ready for containerized deployment

## Tech Stack

I used these technologies for this project:

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

The project follows a standard MVC pattern with clean separation of concerns:

```
src/
├── config/            # Database, Redis, environment configs
├── database/          # TypeORM data source setup
├── models/            # TypeORM entities
├── repositories/      # Database query logic
├── services/          # Business logic
├── controllers/       # Request/response handling
├── routes/            # Express routes
├── middlewares/       # Authentication, authorization, rate limiting
├── validators/        # Request validation
├── sockets/           # Socket.IO logic
├── types/             # Type definitions
├── utils/             # Helper functions and Redis wrapper
├── errors/            # Custom error classes
├── app.ts             # Express app configuration
└── server.ts          # Server entry point
uploads/
├── menu/              # Storage for menu item images
└── restaurants/       # Storage for restaurant images
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

## Getting Started

To get this project running locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (check the section above)
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

## Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

## API Endpoints

I've included a Postman collection in `docs/restaurant-ordering-system.postman_collection.json` that has all the endpoints ready to go. Just import it into Postman and you can start testing right away.

### Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Get JWT tokens for a user
- `GET /api/auth/me` - Get current user's profile info

#### Restaurants
- `GET /api/restaurants` - List all active restaurants
- `GET /api/restaurants/:id` - Get a specific restaurant
- `POST /api/restaurants` - Create a restaurant (requires auth, form-data with image upload)
- `PUT /api/restaurants/:id` - Update a restaurant (requires auth, form-data with optional image upload)
- `DELETE /api/restaurants/:id` - Soft delete a restaurant (requires auth)

#### Menu
- `GET /api/menu/restaurant/:restaurantId` - Get menu for a specific restaurant
- `GET /api/menu/:id` - Get a specific menu item
- `POST /api/menu` - Add a menu item (requires auth, form-data with image upload)
- `PUT /api/menu/:id` - Update a menu item (requires auth, form-data with optional image upload)
- `DELETE /api/menu/:id` - Soft delete a menu item (requires auth)

#### Orders
- `POST /api/orders` - Place a new order (requires auth)
- `GET /api/orders` - Get orders for the current customer (requires auth)
- `GET /api/orders/:id` - Get a specific order (requires auth)
- `GET /api/orders/restaurant/:restaurantId` - Get orders for a specific restaurant (requires auth)
- `PUT /api/orders/:id/status` - Update order status (requires auth)

## Using the Postman Collection

I've included a complete Postman collection to make testing easier:

1. Import the collection file (`docs/restaurant-ordering-system.postman_collection.json`) into Postman
2. Import the environment file (`docs/restaurant-ordering-system.postman_environment.json`)
3. Set the `baseUrl` variable to your server URL (default: `http://localhost:3000`)
4. Start by creating an account with the "Register User" endpoint
5. Login with the "Login User" endpoint to get your access tokens
6. Set the `accessToken` variable in the environment with the token you received
7. The protected endpoints will now work with the token in the Authorization header

For endpoints that handle image uploads:
- Make sure to use "form-data" in the request body
- Add text fields as key-value pairs
- Add image files with the key name "image" and select your file

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "details": {}
}
```

This makes it easier to handle errors consistently on the frontend.

## Caching

I've implemented Redis caching for menu endpoints to improve performance. Menu data is cached for 10 minutes and automatically invalidated when menu items are updated or deleted, ensuring fresh data is always served.

## Real-time Updates with Socket.IO

The system uses Socket.IO for real-time order updates:

- `joinRestaurantRoom`: Restaurant staff can join their restaurant's room to receive order notifications
- `joinOrderRoom`: Customers can join their order's room to track status changes
- `orderCreated`: Emitted when a new order comes in (heard by restaurant staff)
- `orderStatusUpdated`: Emitted when an order status changes (heard by customers and restaurant staff)

## Testing

I haven't added unit tests yet, but the project structure is set up to easily add them later:

```bash
npm test
```

This will run any tests you add using Jest.

## Development

For development work, I use:

```bash
npm run dev
```

This runs the server with nodemon so it automatically restarts when you make changes to the code.

## Production Deployment

To deploy this for production:

1. Build the project: `npm run build`
2. Set `NODE_ENV=production` in your environment
3. Start the server: `npm start`

Make sure your environment variables are properly configured for production, especially database connections and JWT secrets.

## API Response Format

All successful API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

This makes it easy to handle responses on the frontend since you know what to expect.

## File Uploads

I've implemented image upload functionality for restaurants and menu items:
- Restaurant images go in `uploads/restaurants/`
- Menu item images go in `uploads/menu/`
- Only JPEG and PNG files are allowed
- Maximum file size is 2MB
- Image paths are stored in the database and returned in API responses

The upload functionality uses Multer for handling file uploads and includes validation for file types and sizes.

## Utility Functions

I've added some helpful utility functions:

- `addMinutes(date: Date, minutes: number): Date` - Adds minutes to a date object
- `safeParse<T>(str: string): T | null` - Safely parses JSON without throwing errors
- Custom `AppError` class for consistent error handling throughout the app
- Redis JSON wrapper methods (`setJSON`, `getJSON`) for easier Redis operations

## Type Definitions

I've centralized all application enums in `src/types/enums.ts` for better maintainability:

- `UserRole`: ADMIN, RESTAURANT_OWNER, CUSTOMER
- `MenuItemCategory`: APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE, SIDE
- `OrderStatus`: PENDING, PREPARING, READY, DELIVERED, CANCELLED
- `PaymentStatus`: PENDING, SUCCESS, FAILED

This makes it easier to update enum values in one place and keeps the code DRY.