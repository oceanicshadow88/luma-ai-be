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
- ESLint for code quality
- Prettier for consistent code formatting

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

To start test for format, eslint and start dev:

```bash
npm run check
```

To start the development server with hot-reloading:

```bash
npm run dev
```

### Code Quality and Formatting

This project uses ESLint and Prettier to ensure code quality and consistent formatting.

#### Available Commands

- Check for linting issues:

  ```bash
  npm run lint:check
  ```

- Fix linting issues automatically:

  ```bash
  npm run lint
  ```

- Check code formatting:

  ```bash
  npm run format:check
  ```

- Format code automatically:

  ```bash
  npm run format
  ```

#### VS Code Integration

For the best development experience in VS Code, install the ESLint and Prettier extensions and add this to your workspace settings:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript"]
}
```

### Production

To build and start for production:

```bash
npm run build
npm start
```

## Testing

This project uses Jest as the testing framework with TypeScript support. Tests are organized into unit tests and integration tests.

### Test Structure

```
tests/
├── setup.ts           # Global test setup and teardown
├── integration/       # Integration tests
│   └── userApi.test.ts # API endpoint tests
└── unit/              # Unit tests
    ├── userController.test.ts  # Controller tests
    └── userService.test.ts     # Service tests
```

### Test Setup

The testing environment uses a separate MongoDB database to ensure tests don't affect your development or production data. Configuration is managed through the `.env.test` file.

### Running Tests

The following commands are available for testing:

- Run all tests:
  ```bash
  npm test
  ```

- Run tests in watch mode (useful during development):
  ```bash
  npm run test:watch
  ```

- Run only unit tests:
  ```bash
  npm run test:unit
  ```

- Run only integration tests:
  ```bash
  npm run test:integration
  ```

- Generate test coverage report:
  ```bash
  npm run test:coverage
  ```

### Testing Approaches

1. **Unit Tests**: Test individual components in isolation (services, controllers) with dependencies mocked.

2. **Integration Tests**: Test the API endpoints end-to-end, including database operations and middleware.

3. **Validation Testing**: Ensure proper error handling and validation of inputs.

### Best Practices

- Keep tests independent and isolated
- Use descriptive test and variable names
- Follow the AAA pattern: Arrange, Act, Assert
- Clean up test data after test runs
- Mock external dependencies in unit tests

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
