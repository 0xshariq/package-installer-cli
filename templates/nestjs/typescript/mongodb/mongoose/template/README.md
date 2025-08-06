# NestJS + MongoDB + Mongoose Template

A modern, production-ready NestJS application template with MongoDB integration using Mongoose.

## 🚀 Features

- **NestJS Framework**: Progressive Node.js framework for building efficient server-side applications
- **MongoDB Integration**: NoSQL database with Mongoose ODM for schema modeling
- **TypeScript**: Full TypeScript support with type-safe database operations
- **RESTful API**: Complete CRUD operations with Users example
- **Environment Configuration**: Easy environment-based configuration
- **Testing**: Jest testing framework with unit and e2e tests
- **Linting**: ESLint and Prettier for code quality
- **Hot Reload**: Development server with hot reload

## 📦 Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/nestjs-app
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## 🚀 Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3000`

## 📋 API Endpoints

### Users API
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Example API Usage

**Create User:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "age": 30}'
```

**Get All Users:**
```bash
curl http://localhost:3000/users
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── dto/                 # Data Transfer Objects
├── schemas/             # Mongoose Schemas
├── users/              # Users module
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## 🔧 Database Schema

The template includes a User schema with the following fields:
- `name` (required)
- `email` (required, unique)
- `age` (optional)
- `isActive` (default: true)
- `createdAt` (auto-generated)
- `updatedAt` (auto-generated)

## 🌟 Development

1. **Adding New Modules:**
   ```bash
   nest generate module module-name
   nest generate controller module-name
   nest generate service module-name
   ```

2. **Database Operations:**
   The template uses Mongoose decorators for schema definition and provides type-safe operations.

3. **Environment Variables:**
   All configuration should be done through environment variables for better security and deployment flexibility.

## 📝 License

This project is [MIT licensed](LICENSE).

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## 💡 Next Steps

- Add authentication with JWT
- Implement data validation with class-validator
- Add API documentation with Swagger
- Set up database migrations
- Add caching with Redis
- Implement rate limiting
- Add logging with Winston

Happy coding! 🚀
