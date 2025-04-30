# LUMA AI Backend

A RESTful API(Frontend - backend) backend built with Express.js and TypeScript for the LUMA AI application.

## Features

- TypeScript for type safety and better developer experience
- Express.js for routing and middleware
- MongoDB with Mongoose for database operations
- Environment-based configuration
- Error handling middleware
- Layered architecture (MVC+)
- Input validation

## Project Structure

```
src/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── database/           # Database connection and setup
├── error/              # Error handling classes
├── lib/                # Reusable libraries and utilities
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # Express routes
├── services/           # Business logic
├── utils/              # Utility functions
├── validations/        # Input validation
└── server.ts           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:

```bash
git clone https://github.com/oceanicshadow88/luma-ai-be.git
cd luma-ai-be
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/luma-ai
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### Development

To start the development server with hot-reloading:

```bash
npm run dev
```

### Production

To build and start for production:

```bash
npm run build
npm start
```

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update an existing user
- `DELETE /api/users/:id` - Delete a user

### Health Check

- `GET /api/health` - Check API health status

## License

[ISC](LICENSE)