# Skill Swap

Campus Skill Exchange & Micro-Learning Platform.

A full-stack app with React/Vite frontend, Node/Express backend, MySQL database, and Socket.io real-time features.

## Features

- User authentication (login/register)
- Admin dashboard and admin-only API routes
- Skill discovery, sessions, lessons, quizzes, reviews, messaging, notifications
- Password reset flow using department verification
- Real-time chat and online presence with Socket.io
- MySQL database integration and seedable schema

## Repository structure

- `client/` - React frontend powered by Vite
- `server/` - Express backend API and MySQL database connection
- `server/db/` - schema and setup scripts for MySQL
- `server/scratch/` - helper scripts for reset/password tasks
- `.env` - local configuration (not committed)

## Prerequisites

- Node.js 18+ / npm
- MySQL server running locally
- Git

## Setup

1. Clone the repo locally or use this repository:
   ```bash
   git clone https://github.com/yaswanth-sketch/Skill-Swap.git
   cd Skill-Swap
   ```

2. Create a `.env` file in the project root with values like:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=srm123
   DB_NAME=campus_skill_exchange
   DB_PORT=3306

   JWT_SECRET=campus_skill_exchange_secret_key_2024
   JWT_EXPIRES_IN=7d

   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. Install dependencies for the root, backend, and frontend:
   ```bash
   npm run install-all
   ```

4. Initialize or reset the database schema:
   ```bash
   npm run setup-db
   ```

## Running the app

Start both backend and frontend together:

```bash
npm run dev
```

Then open:

- Frontend: `http://localhost:5173/` (or the next available port if `5173` is taken)
- Backend health: `http://localhost:5000/api/health`

### Backend only

```bash
cd server
npm run dev
```

### Frontend only

```bash
cd client
npm run dev
```

## Environment and API

Frontend uses the browser hostname and port `5000` for API requests by default. If the app is served from another machine, the client will call:

```text
http://<browser-hostname>:5000/api
```

The backend exposes routes like:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/reset-password`
- `GET /api/skills`
- `GET /api/sessions/my`
- `GET /api/lessons`
- `GET /api/users/leaderboard`
- `GET /api/messages/conversations`
- `GET /api/admin/stats`

## Default/demo users

The repository includes seeded user data in `server/db/schema.sql`.

### Known accounts

- Admin: `yaswanth.chittiboina999@gmail.com`
- Password reset helper available in `server/scratch/reset_admin.js`

### Demo password for non-admin users

You can reset all non-admin accounts to a common demo password using a helper script or by running:

```bash
cd server
node scratch/reset_admin.js demo@123
```

Then login with any non-admin email and `demo@123`.

## Reset password helper

The app includes a helper script for admin password resets:

```bash
cd server
node scratch/reset_admin.js
```

You can also pass a custom password:

```bash
node scratch/reset_admin.js MyNewPass@123
```

## Notes

- `.env` is ignored by Git. Keep your local environment variables private.
- If your frontend port is already in use, Vite will choose the next available port automatically.
- If MySQL fails to connect, confirm your `.env` DB credentials and that the MySQL service is running.

## Useful commands

```bash
npm run install-all
npm run setup-db
npm run dev
cd server && npm run dev
cd client && npm run dev
```

## License

Use this repository as a learning or demo project.
