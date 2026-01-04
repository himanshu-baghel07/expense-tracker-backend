# Expense Tracker Backend

A robust Node.js backend API for expense tracking application built with Express.js, TypeScript, and MongoDB.

## Features

- **User Authentication**: Secure registration, login, and logout with JWT tokens
- **Expense Management**: Track income and expenses with categories
- **Category System**: Custom categories with icons and colors
- **User Profiles**: Customizable profiles with currency and budget settings
- **MongoDB Integration**: Efficient data storage with Mongoose ODM
- **TypeScript**: Full type safety and modern JavaScript features

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv for configuration

## Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server entry point
├── config/
│   └── database.config.ts
├── controllers/        # Request handlers
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── expense.controller.ts
│   └── user.controller.ts
├── models/            # MongoDB schemas
│   ├── user.model.ts
│   ├── expense.model.ts
│   └── category.model.ts
├── routes/            # API routes
│   └── auth.routes.ts
├── services/          # Business logic
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── expense.service.ts
│   └── user.service.ts
├── types/             # TypeScript definitions
│   └── types.ts
├── middleware/        # Custom middleware
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd expense-tracker-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Data Models

#### User

```typescript
{
  name: string;
  email: string;
  password: string;
  profile: {
    avatar?: string;
    currency: string; // default: "INR"
    monthlyBudget?: number;
  };
}
```

#### Expense

```typescript
{
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
  userId: ObjectId;
  notes?: string;
}
```

#### Category

```typescript
{
  name: string;
  icon: string; // default: "📁"
  color: string; // hex color, default: "#6366f1"
  userId: ObjectId;
}
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Code Style

- TypeScript with strict mode enabled
- ES modules (ESM) syntax
- Consistent naming conventions
- Proper error handling

## Environment Variables

| Variable         | Description               | Default |
| ---------------- | ------------------------- | ------- |
| `PORT`           | Server port               | 5001    |
| `MONGODB_URI`    | MongoDB connection string | -       |
| `JWT_SECRET`     | JWT signing secret        | -       |
| `JWT_EXPIRES_IN` | JWT expiration time       | 7d      |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
