# HMS Backend Setup Instructions

## Step 1: Create Environment File

Create a `.env` file in the `hms-desktop/backend/` directory with the following content:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:Himanshu@123@localhost:5432/hms_database"
DATABASE_USER="postgres"
DATABASE_PASSWORD="Himanshu@123"
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
DATABASE_NAME="hms_database"

# JWT Configuration
JWT_SECRET="hms_jwt_secret_key_2024_secure_random_string_12345"
JWT_REFRESH_SECRET="hms_refresh_secret_key_2024_secure_random_string_67890"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT="3000"
NODE_ENV="development"
API_BASE_URL="http://localhost:3000/api"

# Application Configuration
APP_NAME="HMS Desktop"
APP_VERSION="1.0.0"
HOSPITAL_NAME="Your Hospital Name"
HOSPITAL_ADDRESS="Your Hospital Address"

# Security Configuration
BCRYPT_ROUNDS="12"
CORS_ORIGIN="http://localhost:3000"
SESSION_SECRET="hms_session_secret_2024_secure_random_string"

# File Upload Configuration
MAX_FILE_SIZE="10MB"
UPLOAD_PATH="./uploads"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis Configuration (for session management)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# Logging Configuration
LOG_LEVEL="info"
LOG_FILE_PATH="./logs/hms.log"

# Backup Configuration
BACKUP_PATH="./backups"
BACKUP_RETENTION_DAYS="30"

# System Configuration
DEFAULT_PAGE_SIZE="20"
MAX_PAGE_SIZE="100"
DEFAULT_TAX_RATE="18"

# Development Configuration
DEBUG="true"
ENABLE_SWAGGER="true"
ENABLE_LOGGING="true"
```

## Step 2: Database Setup

1. **Start PostgreSQL service** (make sure it's running on localhost:5432)

2. **Create the database:**
   ```sql
   -- Connect to PostgreSQL as postgres user
   psql -U postgres
   
   -- Create the database
   CREATE DATABASE hms_database;
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE hms_database TO postgres;
   ```

## Step 3: Run Database Migrations

```bash
cd hms-desktop/backend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

## Step 4: Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or build and start production mode
npm run build
npm start
```

## Step 5: Test the API

The server should be running on `http://localhost:3000`

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Login Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change the default password after first login!

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

## Troubleshooting

1. **Database Connection Issues:**
   - Ensure PostgreSQL is running
   - Check database credentials in .env file
   - Verify database exists

2. **Port Already in Use:**
   - Change PORT in .env file
   - Or kill the process using port 3000

3. **Prisma Issues:**
   - Run `npm run prisma:generate` after schema changes
   - Check DATABASE_URL in .env file

## Next Steps

1. ✅ Backend server setup complete
2. 🔄 Implement patient management endpoints
3. 🔄 Implement appointment system
4. 🔄 Implement consultation workflow
5. 🔄 Implement prescription system
6. 🔄 Implement lab test management
7. 🔄 Implement pharmacy system
8. 🔄 Implement billing system
9. 🔄 Connect frontend to backend API
