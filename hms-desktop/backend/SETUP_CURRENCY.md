# Currency System Setup Instructions

## Issue Resolution

The errors you're seeing are because:
1. Prisma client needs to be regenerated after schema changes
2. Database migrations need to be applied

## Step-by-Step Fix

### Step 1: Stop the Running Server

**IMPORTANT:** You must stop the backend server before regenerating Prisma client.

Press `Ctrl+C` in the terminal where the server is running.

### Step 2: Run Database Migrations

```bash
cd hms-desktop/backend

# 1. Add display_currency column to hospital_config
npx ts-node prisma/migrations/migrate_hospital_config_currency.ts

# 2. Migrate existing exchange rates (if any)
npx ts-node prisma/migrations/migrate_exchange_rates.ts
```

### Step 3: Apply Schema Changes to Database

```bash
npx prisma db push
```

This will:
- Add `display_currency` column to `hospital_config` table
- Create `currency_exchange_rates` table

### Step 4: Regenerate Prisma Client

```bash
npx prisma generate
```

This regenerates the Prisma client with the new models and fields.

### Step 5: Restart the Server

```bash
npm run dev
```

The server should now start without errors.

## Verification

After restarting, you should see:
- ✅ No errors about `displayCurrency` field
- ✅ No errors about `currencyExchangeRate` model
- ✅ Currency scheduler started successfully
- ✅ Exchange rates being fetched and stored

## Troubleshooting

### If Prisma Generate Fails

If you get "operation not permitted" error:
1. Make sure the server is completely stopped
2. Close any IDEs or tools that might be using the Prisma client
3. Try again: `npx prisma generate`

### If Database Migration Fails

If migration scripts fail:
1. Check database connection in `.env` file
2. Verify you have permissions to modify the database
3. Check if tables/columns already exist

### If Server Still Shows Errors

1. Check that `display_currency` column exists:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'hospital_config' AND column_name = 'display_currency';
   ```

2. Check that `currency_exchange_rates` table exists:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'currency_exchange_rates';
   ```

3. If missing, run the migration scripts again

## Notes

- The code has been updated with fallback mechanisms to handle cases where Prisma models aren't available yet
- Raw SQL queries are used as fallbacks until Prisma client is regenerated
- Once Prisma client is regenerated, it will use the proper Prisma models
















