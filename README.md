<h1 align="center">Star Wars API</h1>
<p>This project is an API that allows managing Star Wars movie information, with authentication and authorization features. It implements a clean architecture following Domain-Driven Design (DDD) principles.</p>

## Prerequisites
- Node.js (version >= 20)
- PostgreSQL
- npm

## Install dependencies
```bash
npm install
```

## Configure environment variables
### Create a .env file in the project root with the following structure:

```bash
API_URL=
PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_PORT=
DB_HOST=
DB_DIALECT=
DB_SSL=true
JWT_SECRET_KEY=
JWT_EXPIRATION_TIME=
SWAPI_BASE_URL=
```
## Run migrations and seeders

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Run tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e
```

## API Docs

```bash
/api/docs
```
