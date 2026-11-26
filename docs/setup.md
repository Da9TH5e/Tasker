# Tasker setup

[Back to Tasker](../README.md)

## 🏗️ Project Structure

```text
Tasker/
├── backend/
│   ├── app.py              # Flask API
│   ├── schema.sql          # SQL table definitions
│   ├── wsgi.py             # Serves the production frontend and API
│   └── requirements.txt
└── frontend/              # React and TypeScript web app
```

## ⛳ API Endpoints

Hosted API routes are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login + get tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout | No |
| POST | `/auth/change-password` | Change the signed-in account password | Yes |
| POST | `/auth/forgot-password` | Request an emailed verification code | No |
| POST | `/auth/reset-password` | Reset a password using the verification code | No |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks (paginated) | Yes |
| POST | `/tasks` | Create a task | Yes |
| GET | `/tasks/:id` | Get single task | Yes |
| PATCH | `/tasks/:id` | Update a task | Yes |
| DELETE | `/tasks/:id` | Delete a task | Yes |
| PATCH | `/tasks/:id/toggle` | Toggle done/pending | Yes |

### Timer
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/timer` | Save timer session | Yes |
| GET | `/timer` | Get all sessions | Yes |
| GET | `/timer/stats` | Get aggregated stats | Yes |

## 💻 Getting Started

Install Python 3.10 or later and Node.js 20.19+ on the 20.x line or Node.js 22.12+ with npm. From the project root, run these commands in PowerShell.

### 1. Start the Flask backend

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe backend\app.py
```

The API runs at **http://localhost:5000**. Flask creates an SQLite database on first launch. To use another path, set `$env:TASKER_DATABASE` to a new file path before starting Flask. The backend creates the tables at startup.

### 2. Start the frontend

In a second terminal, from the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open **http://localhost:3000**. Set `VITE_API_URL` in the frontend environment only if the backend uses a different URL.

Run `npm run build` in `frontend` to type-check and create the production bundle in `frontend/dist`. Configure your static host to serve `index.html` for app routes such as `/dashboard`.

### Backend configuration

For local use, the backend generates JWT signing secrets when it starts. Sign in again after restarting the backend, or set distinct `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values to keep tokens valid across restarts. Set `TASKER_ORIGINS` to a comma-separated list of allowed frontend origins if the frontend runs outside the default local origins.

### Change your password

Sign in and select **Change password** in the dashboard. Enter and confirm your new password. Sign in again after saving.

### Forgot your password

Turn on Google **2-Step Verification** and create an [App Password](https://myaccount.google.com/apppasswords). Stop Flask and run the following from the project root.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-gmail.ps1
```

Enter your Gmail address and the generated app password. The launcher prompts for it privately and does not save it to disk. For deployments, set `TASKER_GMAIL_EMAIL` and `TASKER_GMAIL_APP_PASSWORD` in the backend environment.

On Tasker's sign-in page, click **Forgot password?** and request a code for the email registered in Tasker. Enter the emailed code and confirm your new password. Codes expire after 10 minutes and work once. Successful resets end existing sessions and return you to sign-in.

## Host on Render

The Render Blueprint runs React and Flask as a single service with one public URL. The frontend uses the same URL for API requests under `/api`. SQLite lives on a persistent disk at `/var/data/tasker.db`, and the hosted app starts with an empty database. Local accounts and tasks can be migrated separately if needed.

1. Push this project to a GitHub repository. Keep the local database and credentials out of Git.
2. In the Render dashboard, choose **New → Blueprint** and connect the repository containing `render.yaml`.
3. Enter your Gmail sender address and Google App Password in the secret prompts. Review the paid Starter service and 1 GB disk before applying the Blueprint.
4. Once deployed, open the service's public URL. Create a Tasker account and try **Forgot password?** to verify mail from the hosted service.

## Free hosting on PythonAnywhere

Upload the production files with `frontend/dist` already built using `VITE_API_URL=/api`. The free PythonAnywhere plan includes one web app, a persistent home directory for SQLite, and a monthly expiry. Renew the web app from the dashboard when prompted. Only the optional Render deployment uses the paid Blueprint.

1. Upload and extract the deployment ZIP as `~/tasker` using the PythonAnywhere Files tab and Bash console.
2. Create a virtual environment with the same Python version selected for the web app. Install `~/tasker/backend/requirements.txt` into it.
3. Create a web app with **Manual configuration**, select that virtual environment on the Web tab, and use this WSGI configuration. Replace `YOUR_USERNAME` with your PythonAnywhere username.

```python
import json
import os
import sys
from pathlib import Path

home = Path("/home/YOUR_USERNAME")
settings = home / ".tasker-settings.json"
if settings.exists():
    os.environ.update(json.loads(settings.read_text()))
os.environ["TASKER_DATABASE"] = str(home / "tasker-data" / "tasker.db")
sys.path.insert(0, str(home / "tasker" / "backend"))
from wsgi import application
```

4. For password reset email, create a free Brevo account, verify a sender, and create an API key. PythonAnywhere's free outbound proxy allows the Brevo HTTPS API. Use your verified sender for `TASKER_BREVO_SENDER`. Brevo may replace a Gmail or Yahoo sender address, and inbox delivery depends on its sender rules. Local Gmail SMTP still works with `start-gmail.ps1`.
5. Store these settings outside the uploaded app. In a PythonAnywhere Bash console, run the command below and enter the Brevo credentials when prompted. It also creates persistent signing keys. Run it once to avoid invalidating active sessions by replacing the keys.

```bash
umask 077
python - <<'PY'
import json
import secrets
from getpass import getpass
from pathlib import Path
with (Path.home() / ".tasker-settings.json").open("x") as config:
    json.dump({
        "TASKER_EMAIL_PROVIDER": "brevo",
        "TASKER_BREVO_SENDER": input("Verified Brevo sender email: ").strip(),
        "TASKER_BREVO_API_KEY": getpass("Brevo API key: ").strip(),
        "JWT_ACCESS_SECRET": secrets.token_hex(32),
        "JWT_REFRESH_SECRET": secrets.token_hex(32)
    }, config)
PY
```

6. Reload the web app, open its public URL, and test registration and password recovery. The hosted database starts empty.

## Host on a Linux VPS

Use Docker Engine with the Compose plugin. Point the domain or subdomain in `TASKER_HOSTNAME` at the VPS and allow inbound TCP 80 and 443 through its firewall. If another service already uses those ports, integrate Tasker with that service's reverse proxy instead of starting a second proxy.

On the VPS, copy `.env.example` to `.env`, restrict it with `chmod 600 .env`, and fill in the hostname plus two distinct JWT keys. Generate each key with `openssl rand -hex 32`. For password recovery, enter your Gmail address and app password. If SMTP is blocked, set `TASKER_EMAIL_PROVIDER=brevo` and add `TASKER_BREVO_SENDER` and `TASKER_BREVO_API_KEY` to `.env`.

Run `docker compose up -d --build` in the project directory. Caddy serves the app by HTTPS, and Docker keeps the database in the `tasker_data` volume across container replacements. The database starts empty. Use `docker compose ps` to check health, then open your hostname and test sign-in and recovery.
