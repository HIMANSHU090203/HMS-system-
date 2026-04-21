# AWS-Deployment-steps

High-level architecture, gaps to implement for reliable multi-machine operation, AWS (free-tier–friendly) provisioning, deployment runbook, and post-deployment steps to point the Electron app at your hosted API.

**Scope:** This document aligns with the architecture discussed for ZenHosp / HMS: **RDS PostgreSQL** as system of record, **Node/Express API** on **EC2** (or similar), **Electron** clients on hospital PCs. Optional **SQLite + sync** is shown where it is **not yet implemented** in the codebase but is required for full offline resilience.

---

## 1. Target architecture (high level)

### 1.1 Logical view

```mermaid
flowchart TB
  subgraph clients [Hospital PCs - Electron]
    EL[Electron shell\nMain + Preload + Renderer]
    UI[React UI]
    AX[Axios API client\nJWT in storage]
    EL --> UI --> AX
    subgraph future [To implement for offline / every-system reliability]
      LQ[(SQLite\nlocal cache + sync_queue)]
      SE[Sync engine\nretry backoff conflict policy]
      UI -.-> LQ
      LQ -.-> SE
      SE -.-> AX
    end
  end

  subgraph aws [AWS - same account / region]
    SG[Security groups\nleast privilege]
    EC2[EC2 instance\nt2.micro or t3.micro\nNode + PM2]
    RDS[(Amazon RDS\nPostgreSQL)]
    EC2 --> SG
    RDS --> SG
    EC2 --> RDS
  end

  AX -->|HTTPS /api| EC2
  EC2 -->|Prisma DATABASE_URL| RDS
```

**Legend:** Solid lines = what the stack already assumes today (online API + Postgres on server). Dotted **future** box = pieces from the architecture discussion that are **not** fully present in the project yet but matter if you want offline operation and stronger “works everywhere” behavior.

### 1.2 Network / security view (production-shaped)

```mermaid
flowchart LR
  Internet((Internet))
  Internet -->|443 HTTPS| ALB[Nginx or ALB\nTLS termination]
  ALB -->|3000 or unix socket| API[Express API]
  API -->|5432 private| RDS[(RDS PostgreSQL\nprivate subnet)]

  subgraph not_allowed [Avoid in production]
    PC[Client PC] -.->|5432 direct to RDS| RDS
  end
```

- **Clients** should talk only to **HTTPS API**, not to RDS.
- **RDS** should be **private**; only the app tier security group may open **5432** to RDS.

---

## 2. Gaps to implement (so the app behaves reliably on every system)

These are the main **missing or incomplete** areas relative to the target architecture and “works on each system” expectations.

| Area | Why it matters | Direction (no code here) |
|------|----------------|-------------------------|
| **Hosted API URL in production** | Packaged Electron must call AWS, not `localhost`. | Define **per-environment** API base URL (`VITE_API_URL` at build time and/or **runtime config** file beside the installer). |
| **HTTPS + domain** | Browsers/Electron security, JWT over cleartext, compliance. | Terminate TLS on **Nginx** or **ALB**; use a real hostname (e.g. `api.hospital.example`). |
| **CORS + CSP** | Remote API + Electron `connect-src` must allow your API origin. | Align **backend `CORS_ORIGIN`** and **Electron main-process CSP** with the deployed API URL. |
| **Secrets & config** | No RDS password in the client; rotate keys. | **AWS Secrets Manager** or **SSM Parameter Store** on EC2; only server reads `DATABASE_URL` / `JWT_SECRET`. |
| **SQLite + sync (optional but in architecture)** | Offline queues and local cache. | **better-sqlite3** (or equivalent), **outbox table**, **replay with auth**, **conflict/versioning**, **pull sync** API; treat SQLite as **never** source of truth. |
| **Connectivity detection** | `navigator.onLine` is unreliable. | Combine with **ping `/health`** or lightweight authenticated endpoint. |
| **Token lifecycle** | Long offline queues + expired JWT. | Refresh or re-login before replay; clear queue policy for permanently failed ops. |
| **Multi-PC consistency** | Two users edit same record. | Prefer **server authority**; define **LWW vs merge** per entity; avoid blind “last write wins” for clinical-critical fields without review. |
| **Windows installer quality** | “Works on every system” includes SmartScreen and updates. | **Code signing** for installers; plan **auto-update** (e.g. Electron updater) if you ship frequently. |
| **Observability** | Production debugging. | Centralized logs (CloudWatch agent / PM2 logs), RDS backups and alarms. |
| **Migrations** | Schema drift between server and old clients. | **Prisma migrate deploy** in release process; versioned API; client compatibility matrix. |

Until **SQLite + sync** is implemented, the product remains **online-first**: every workstation must reach the API for writes to succeed.

---

## 3. AWS account and free-tier–friendly resources

> **Note:** AWS free tier and instance families change by account age and region. **t2.micro** is the classic free-tier size; many accounts today get **t3.micro** in the free tier. Pick the **Free tier eligible** option shown in the console when you launch.

### Step 3.1 — Create an AWS account

1. Go to [https://aws.amazon.com/](https://aws.amazon.com/) and create an account.
2. Complete **billing** and **root MFA** (strongly recommended).
3. Choose a **primary region** (e.g. `ap-south-1` Mumbai) and stick to it for EC2 + RDS to avoid cross-region latency and cost.

### Step 3.2 — Create an IAM admin user (day-to-day)

1. Open **IAM** → **Users** → **Create user** (e.g. `hms-admin`) with **AdministratorAccess** for initial setup (narrow later).
2. Enable **MFA** for this user.
3. Use this user for console/CLI; avoid using the **root** user daily.

### Step 3.3 — Default VPC (POC)

1. **VPC** → confirm a **default VPC** exists (typical for new accounts).
2. For a **first POC**, you can place EC2 in a public subnet with a public IP. For production, plan **private RDS + public or ALB-fronted EC2** (or private EC2 + ALB only).

---

## 4. Steps to get RDS PostgreSQL (same platform as backend)

1. **RDS** → **Create database**.
2. Engine: **PostgreSQL** (version compatible with your Prisma schema).
3. Template: **Free tier** if available.
4. **DB instance identifier:** e.g. `zenhosp-db`.
5. **Master username / password:** store in a password manager; you will put them only in **server** `.env` / Secrets Manager.
6. **Instance class:** smallest eligible (e.g. **db.t3.micro** or free-tier size shown).
7. **Storage:** default gp2/gp3 minimum is fine for dev.
8. **Connectivity:**
   - **VPC:** default for POC.
   - **Public access:** for learning only; **prefer private** and connect from EC2 in same VPC.
9. **VPC security group:** create **RDS-SG**:
   - Inbound: **PostgreSQL 5432** from **EC2-SG only** (best), or temporarily from your IP for debugging (remove later).
10. Create database and wait until **Available**.
11. Note **endpoint** (host), **port** (5432), **database name**, user, password → build  
    `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME`

---

## 5. Steps to get a free-tier–style EC2 (t2.micro / t3.micro)

1. **EC2** → **Launch instance**.
2. **Name:** e.g. `zenhosp-api`.
3. **AMI:** **Ubuntu Server 22.04 LTS** (or current LTS).
4. **Instance type:** **t2.micro** or **t3.micro** (choose what the console marks **Free tier eligible**).
5. **Key pair:** create new **RSA** `.pem`, download and store safely (required for SSH).
6. **Network settings:**
   - Create or select **EC2-SG** security group.
   - **Inbound:** **SSH 22** from **My IP** only (not `0.0.0.0/0` long term).
   - **Inbound:** **HTTP 80** / **HTTPS 443** if using Nginx/ALB; or **3000** from **My IP** only for quick API test (tighten before production).
7. **Storage:** 8–30 GiB gp3 is enough for POC.
8. **Launch instance** and wait until **Running**; note **Public IPv4** (or attach **Elastic IP** for a stable address).

### Step 5.1 — SSH into EC2 (from your PC)

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 5.2 — Install Node.js (LTS) on Ubuntu (example)

Use Node **18+** to match `engines` in the repo root (`>=18`). Official approach: install **nvm** or use **NodeSource** / distro packages per your org standard. Example with **nvm**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v
npm -v
```

### Step 5.3 — Install Git and clone the repository

```bash
sudo apt update && sudo apt install -y git
git clone <YOUR_REPO_URL>
cd <repo>/hms-desktop/backend
npm ci
```

### Step 5.4 — Configure environment (server only)

Create `.env` on the server (or inject via SSM/Secrets Manager) with at least:

- `DATABASE_URL` → RDS connection string  
- `JWT_SECRET` → long random secret  
- `PORT=3000` (or behind Nginx)  
- `NODE_ENV=production`  
- `CORS_ORIGIN` → your Electron app origin pattern or specific origins (not `*` in production if you can avoid it)

### Step 5.5 — Prisma migrate and (optional) seed

```bash
npx prisma migrate deploy
# Optional: only if you intend seed data in this environment
# npm run prisma:seed
```

### Step 5.6 — Build and run the API

```bash
npm run build
npm start
# Or use PM2 for resilience:
sudo npm install -g pm2
pm2 start dist/index.js --name zenhosp-api
pm2 save
pm2 startup   # follow printed instructions so PM2 survives reboot
```

### Step 5.7 — Verify from your laptop

```bash
curl http://<EC2_PUBLIC_IP>:3000/health
```

Expect JSON with `status: OK` (or equivalent from your `GET /health` handler).

### Step 5.8 — (Recommended before real use) HTTPS

- Point a subdomain (e.g. `api.example.com`) to **Elastic IP** or **ALB**.
- Install **Nginx** + **Let’s Encrypt** (`certbot`) on EC2, or use **Application Load Balancer + ACM** certificate.
- Proxy `https://api...` → `http://127.0.0.1:3000`.

---

## 6. Deploy the application after implementation is complete

When the **missing pieces** you care about (HTTPS, CORS, runtime API URL, optional SQLite/sync) are implemented and merged:

1. **Tag a release** in Git (e.g. `v1.0.0-aws`).
2. **On EC2:** `git pull`, `npm ci`, `npx prisma migrate deploy`, `npm run build`, `pm2 restart zenhosp-api`.
3. **Smoke tests** from a non-server machine:
   - `GET /health`
   - `POST /api/auth/login` (with test user)
   - One authenticated **read** (e.g. config or patients per your policy).
4. **RDS:** confirm automated **backups** window and **retention**; test a **restore** on a scratch instance once.
5. **Monitoring:** CloudWatch alarms on **CPU**, **RDS storage**, **EC2 status check**; log rotation for PM2.

---

## 7. After deployment: connect the Electron app to the API

### Step 7.1 — Decide the production API base URL

- Example: `https://api.yourhospital.com/api`  
- Must match how routes are mounted in the backend (your app uses **`/api`** prefix on the client `API_URL`).

### Step 7.2 — Build the desktop app with that URL

On your **build machine** (CI or developer PC):

1. Set **`VITE_API_URL`** to the production URL **before** running the production build (Vite bakes `import.meta.env` at build time unless you add runtime config).
2. From `hms-desktop`:

   ```bash
   set VITE_API_URL=https://api.yourhospital.com/api   # Windows CMD example
   npm run build
   ```

   Or use a `.env.production` / CI secret store—follow your org’s secret handling.

3. Confirm **Electron main process** CSP / `connect-src` allows that host if you restrict network access in production.

### Step 7.3 — Produce the Windows installer

From `hms-desktop` (Forge):

```bash
npm run make
```

Collect the generated **Setup / Squirrel / MSI** artifacts from the `out/` directory (exact names depend on Forge makers).

### Step 7.4 — Install on a hospital PC and validate

1. Install the generated installer.
2. Launch the app; ensure **first-run setup** (`/api/config/setup-status`) succeeds against the **remote** API (not localhost).
3. **Login** with a user created on that server database.
4. Run through **one write path** (e.g. create patient or prescription) and verify data in **RDS** (read-only query via bastion or admin tool).
5. Test from **two PCs** if possible: same hospital, same API URL, same data visible.

### Step 7.5 — If something fails

| Symptom | Likely cause |
|---------|----------------|
| Cannot reach API | Security group (443/3000), wrong IP, Nginx not proxying. |
| CORS errors in devtools | `CORS_ORIGIN` on server vs actual origin (file:// vs app:// differs for Electron—verify how your app loads the renderer). |
| SSL errors | Incomplete chain, wrong hostname, clock skew on PC. |
| 401 everywhere | Wrong `VITE_API_URL` path, missing `/api`, or token not stored. |
| DB errors on server | `DATABASE_URL`, RDS SG not allowing EC2 SG, RDS not in “available”. |

---

## 8. End-to-end checklist

- [ ] AWS account + IAM user + MFA  
- [ ] RDS PostgreSQL created; **5432** only from app SG  
- [ ] EC2 instance (t2.micro / t3.micro) with Node + PM2 + repo  
- [ ] `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `CORS` set on server  
- [ ] `prisma migrate deploy` applied successfully  
- [ ] `/health` OK over the network path you will use in prod  
- [ ] HTTPS + domain (recommended before real PHI)  
- [ ] Electron built with **`VITE_API_URL`** = production API  
- [ ] Installer smoke-tested on a clean Windows VM  
- [ ] (If required) **SQLite + sync** designed, implemented, and tested for offline/queue scenarios  
- [ ] Backups, alarms, and runbook for rotate-keys / restore  

---

## 9. Document maintenance

Update this file when you change:

- Hosting shape (e.g. move from EC2 to ECS),
- How the Electron app resolves **API base URL**,
- Whether **offline/SQLite** is in scope for v1 or deferred.

---

*Generated for SKY-86–style deployment planning; adjust region, instance types, and security to your org’s policies.*
