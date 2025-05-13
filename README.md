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
loaders/                # Loading and configuring
src/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── database/           # Database connection and setup
├── exceptions/         # Error Exception class
├── error/              # Error handling classes
├── lib/                # Reusable libraries and utilities
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # Express routes
├── services/           # Business logic
├── utils/              # Utility functions
├── validations/        # Input validation
└── server.ts           # Application entry point
tests/                  # Test scripts
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/oceanicshadow88/luma-ai-be.git
cd luma-ai-be
```

2. Install dependencies:

```bash
rm -rf node_modules package-lock.json
npm install --global yarn
yarn install
```

3. copy your a `.env.example` file in the root directory with the following variables:

```
PORT=5000
LOG_LEVEL=info
NODE_ENV=development

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT=100

MONGODB_URI=mongodb://localhost:27017/luma-ai
JWT_SECRET=your_jwt_secret
```

### Development

To start test for format, eslint and test:

```bash
yarn check
```

To start the development server with hot-reloading:

```bash
yarn dev
```

### Code Quality and Formatting

This project uses ESLint and Prettier to ensure code quality and consistent formatting.

#### Available Commands

- Check for linting issues:

  ```bash
  yarn lint:check
  ```

- Fix linting issues automatically:

  ```bash
  yarn lint
  ```

- Check code formatting:

  ```bash
  yarn format:check
  ```

- Format code automatically:

  ```bash
  yarn format
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

### SonarQube 
1. Build sonarqube by docker (.env.development edit by own)

  ```bash
  docker-compose up -d 
  ```

2. then vist http://localhost:9000 to configure project,username:admin, password:admin
3. Configure environment variables in .env.development
##### .env.development
SONAR_HOST_URL=http://localhost:9000                       # website 
SONAR_TOKEN=your_token                                     # own generate token
4. load environment variables

```bash
export $(cat .env.development | xargs)
```
5. run sonarqube scanner (after login in Sonar web)

  ```bash
  npx @sonar/scan   # then visit web: show scanner report
  ```

#### Other commands
- stop sonarqube

  ```bash
  docker-compose stop
  ```
- start sonarqube

  ```bash
  docker-compose start
  ```

- remove sonarqube

  ```bash
  docker-compose down
  ```

#### SonarQube configure (edit by own configuration)
##### sonar-project.properties
sonar.projectKey=luma-ai
sonar.projectName=luma-ai

sonar.host.url=${SONAR_HOST_URL}                          # visit website after run sonarqube docker
sonar.token=${SONAR_TOKEN}                                # edit by own generate token
sonar.login=admin                                         # login with admin, password admin

##### docker-compose.yml
ports:                                                     # edit port
      - "9000:9000"
    env_file:                                              # load environment virable
      - .env.development
##### .env.development
SONAR_HOST_URL=http://localhost:9000                       # website 
SONAR_TOKEN=your_token                                     # own generate token

### Production

To build and start for production:

```bash
yarn build
yarn start
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
  yarn test
  ```

- Run tests in watch mode (useful during development):
  ```bash
  yarn test:watch
  ```

- Run only unit tests:
  ```bash
  yarn test:unit
  ```

- Run only integration tests:
  ```bash
  yarn test:integration
  ```

- Generate test coverage report:
  ```bash
  yarn test:coverage
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


## License

[ISC](LICENSE)
