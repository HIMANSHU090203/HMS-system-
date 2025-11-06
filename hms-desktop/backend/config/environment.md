# HMS Environment Configuration Setup

## Environment Variables Required

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

## Setup Instructions

1. **Create the .env file:**
   ```bash
   cd hms-desktop/backend
   touch .env
   ```

2. **Copy the content above into the .env file**

3. **Update the following values as needed:**
   - `HOSPITAL_NAME`: Your hospital's name
   - `HOSPITAL_ADDRESS`: Your hospital's address
   - `SMTP_USER`: Your email for notifications
   - `SMTP_PASS`: Your email app password

4. **Generate secure JWT secrets:**
   ```bash
   # Generate random JWT secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## Security Notes

- Never commit the `.env` file to version control
- Use strong, unique JWT secrets in production
- Change default passwords and secrets
- Use environment-specific configurations for different deployments

## Database Setup

Make sure PostgreSQL is running and create the database:

```sql
-- Connect to PostgreSQL as postgres user
psql -U postgres

-- Create the database
CREATE DATABASE hms_database;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hms_database TO postgres;
```
