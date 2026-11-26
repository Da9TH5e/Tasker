import hmac
import os
import re
import secrets
import sqlite3
from time import time
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path
from uuid import uuid4

import bcrypt
import jwt
from flask import Flask, abort, g, jsonify, request
from werkzeug.exceptions import HTTPException

from recovery_email import recovery_email_configured, send_recovery_code


ROOT = Path(__file__).resolve().parent
DEFAULT_DATABASE = ROOT / "tasker.db"
STATUSES = ("pending", "in_progress", "done")


def now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def create_app(database=None):
    app = Flask(__name__)
    database = Path(database or os.getenv("TASKER_DATABASE", DEFAULT_DATABASE))
    database.parent.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("JWT_ACCESS_SECRET", secrets.token_hex(32))
    os.environ.setdefault("JWT_REFRESH_SECRET", secrets.token_hex(32))
    token_settings = {
        "access": (os.environ["JWT_ACCESS_SECRET"], 15 * 60),
        "refresh": (os.environ["JWT_REFRESH_SECRET"], 7 * 24 * 60 * 60),
    }
    origins = set(os.getenv(
        "TASKER_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(","))

    def db():
        if "db" not in g:
            g.db = sqlite3.connect(database)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON")
        return g.db

    with app.app_context():
        with db() as connection:
            connection.executescript((ROOT / "schema.sql").read_text(encoding="utf-8"))
            # Carry forward session versions from databases that used email resets.
            if connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'PasswordReset'"
            ).fetchone():
                connection.execute(
                    """INSERT OR IGNORE INTO UserSession (userId, version)
                       SELECT userId, sessionVersion FROM PasswordReset WHERE sessionVersion > 0"""
                )
        g.pop("db").close()

    @app.teardown_appcontext
    def close_db(_error):
        connection = g.pop("db", None)
        if connection is not None:
            connection.close()

    @app.after_request
    def cors(response):
        response.vary.add("Origin")
        origin = request.headers.get("Origin")
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Cache-Control, Pragma"
        return response

    @app.errorhandler(HTTPException)
    def json_error(error):
        return jsonify(error=error.description), error.code

    def body():
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            abort(400, "A JSON object is required")
        return data

    def issue(user_id, kind, version):
        key, lifetime = token_settings[kind]
        issued = int(datetime.now(timezone.utc).timestamp())
        return jwt.encode(
            {"userId": user_id, "iat": issued, "exp": issued + lifetime, "version": version},
            key, algorithm="HS256",
        )

    def token_user(token, kind):
        try:
            payload = jwt.decode(token, token_settings[kind][0], algorithms=["HS256"],
                                 options={"require": ["exp", "userId"]})
            user_id = payload["userId"]
            if isinstance(user_id, str):
                user = db().execute(
                    """SELECT COALESCE(UserSession.version, 0) AS version
                       FROM User LEFT JOIN UserSession ON UserSession.userId = User.id
                       WHERE User.id = ?""", (user_id,)
                ).fetchone()
                if user and payload.get("version", 0) == user["version"]:
                    return user_id, user["version"]
        except jwt.InvalidTokenError:
            pass
        abort(401, f"Invalid or expired {kind} token")

    def authenticated(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            scheme, _, token = request.headers.get("Authorization", "").partition(" ")
            if scheme.lower() != "bearer" or not token:
                abort(401, "No token provided")
            g.user_id, g.session_version = token_user(token, "access")
            return view(*args, **kwargs)
        return wrapped

    def credentials(data):
        email, password = data.get("email"), data.get("password")
        if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
            abort(400, "Email and password are required")
        return email, password

    def auth_response(user_id, email, message, version=0):
        return jsonify(message=message, accessToken=issue(user_id, "access", version),
                       refreshToken=issue(user_id, "refresh", version), user={"id": user_id, "email": email})

    def hash_password(password):
        if not isinstance(password, str) or len(password) < 6:
            abort(400, "Password must be at least 6 characters")
        encoded = password.encode()
        if len(encoded) > 72:
            abort(400, "Password must be at most 72 bytes")
        return bcrypt.hashpw(encoded, bcrypt.gensalt(rounds=10)).decode()

    @app.get("/")
    def health():
        return jsonify(message="Task Management API is running!")

    @app.post("/auth/register")
    def register():
        email, password = credentials(body())
        password_hash = hash_password(password)
        user_id = uuid4().hex
        try:
            with db() as connection:
                connection.execute(
                    "INSERT INTO User (id, email, password, createdAt) VALUES (?, ?, ?, ?)",
                    (user_id, email, password_hash, now()),
                )
        except sqlite3.IntegrityError:
            abort(400, "Email already registered")
        return auth_response(user_id, email, "Account created successfully"), 201

    def verify_credentials(email, password):
        user = db().execute(
            """SELECT User.id, password, COALESCE(UserSession.version, 0) AS version
               FROM User LEFT JOIN UserSession ON UserSession.userId = User.id
               WHERE email = ?""", (email,)
        ).fetchone()
        # bcryptjs truncated older passwords at 72 bytes.
        if user is None or not bcrypt.checkpw(password.encode()[:72], user["password"].encode()):
            abort(401, "Invalid credentials")
        return user

    @app.post("/auth/login")
    def login():
        email, password = credentials(body())
        user = verify_credentials(email, password)
        return auth_response(user["id"], email, "Login successful", user["version"])

    @app.post("/auth/refresh")
    def refresh():
        token = body().get("refreshToken")
        if not isinstance(token, str) or not token:
            abort(401, "Refresh token required")
        user_id, version = token_user(token, "refresh")
        return jsonify(accessToken=issue(user_id, "access", version), refreshToken=token)

    def revoke_sessions(connection, user_id):
        connection.execute(
            """INSERT INTO UserSession (userId, version) VALUES (?, 1)
               ON CONFLICT(userId) DO UPDATE SET version = version + 1""",
            (user_id,),
        )
        connection.execute("DELETE FROM RecoveryCode WHERE userId = ?", (user_id,))

    @app.post("/auth/change-password")
    @authenticated
    def change_password():
        password_hash = hash_password(body().get("newPassword"))
        with db() as connection:
            changed = connection.execute(
                """UPDATE User SET password = ? WHERE id = ?
                   AND COALESCE((SELECT version FROM UserSession WHERE userId = User.id), 0) = ?""",
                (password_hash, g.user_id, g.session_version),
            )
            if changed.rowcount != 1:
                abort(401, "Invalid or expired access token")
            revoke_sessions(connection, g.user_id)
        return jsonify(message="Password updated. Sign in with your new password.")

    def recovery_email(data):
        email = data.get("email")
        if not isinstance(email, str) or len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+", email):
            abort(400, "Enter a valid email address")
        return email

    def recovery_digest(user_id, code):
        key = token_settings["refresh"][0].encode()
        return hmac.digest(key, f"recovery:{user_id}:{code}".encode(), "sha256").hex()

    @app.post("/auth/forgot-password")
    def request_recovery_code():
        email = recovery_email(body())
        if not recovery_email_configured():
            abort(503, "Password recovery email is currently unavailable")

        response = jsonify(message="If that account exists, a verification code will be sent.")
        user = db().execute("SELECT id FROM User WHERE email = ?", (email,)).fetchone()
        if user is None:
            return response

        code = f"{secrets.randbelow(100_000_000):08d}"
        digest = recovery_digest(user["id"], code)
        timestamp = int(time())
        with db() as connection:
            result = connection.execute(
                """INSERT INTO RecoveryCode (userId, digest, sentAt, expiresAt) VALUES (?, ?, ?, ?)
                   ON CONFLICT(userId) DO UPDATE SET digest = excluded.digest,
                       sentAt = excluded.sentAt, expiresAt = excluded.expiresAt, attempts = 0
                   WHERE RecoveryCode.sentAt <= excluded.sentAt - 60""",
                (user["id"], digest, timestamp, timestamp + 600),
            )
        if result.rowcount:
            try:
                send_recovery_code(email, code)
            except OSError as error:
                app.logger.warning("Recovery email failed (%s)", type(error).__name__)
                with db() as connection:
                    connection.execute("DELETE FROM RecoveryCode WHERE userId = ? AND digest = ?", (user["id"], digest))
        return response

    @app.post("/auth/reset-password")
    def reset_password():
        data = body()
        email = recovery_email(data)
        code = data.get("code")
        if not isinstance(code, str) or not re.fullmatch(r"[0-9]{8}", code):
            abort(400, "Enter the 8-digit verification code")

        with db() as connection:
            connection.execute("BEGIN IMMEDIATE")
            recovery = connection.execute(
                """SELECT RecoveryCode.* FROM RecoveryCode JOIN User ON User.id = RecoveryCode.userId
                   WHERE User.email = ? AND expiresAt > ? AND attempts < 5""",
                (email, int(time())),
            ).fetchone()
            valid = recovery is not None and hmac.compare_digest(
                recovery["digest"], recovery_digest(recovery["userId"], code)
            )
            if valid:
                password_hash = hash_password(data.get("newPassword"))
                connection.execute("UPDATE User SET password = ? WHERE id = ?", (password_hash, recovery["userId"]))
                revoke_sessions(connection, recovery["userId"])
            elif recovery is not None:
                connection.execute("UPDATE RecoveryCode SET attempts = attempts + 1 WHERE userId = ?", (recovery["userId"],))
        if not valid:
            abort(400, "Invalid or expired code. Request a new code if needed.")
        return jsonify(message="Password updated. Sign in with your new password.")

    @app.post("/auth/logout")
    def logout():
        return jsonify(message="Logged out successfully")

    def get_task(task_id):
        task = db().execute(
            "SELECT * FROM Task WHERE id = ? AND userId = ?", (task_id, g.user_id)
        ).fetchone()
        if task is None:
            abort(404, "Task not found")
        return dict(task)

    def task_fields(data):
        fields = {}
        if "title" in data:
            title = data["title"]
            if not isinstance(title, str) or not title.strip():
                abort(400, "Title is required")
            fields["title"] = title.strip()
        if "description" in data:
            description = data["description"]
            if description is not None and not isinstance(description, str):
                abort(400, "Description must be text")
            fields["description"] = (description or "").strip() or None
        if "status" in data:
            if data["status"] not in STATUSES:
                abort(400, "Status must be pending, in_progress, or done")
            fields["status"] = data["status"]
        if "timeGoal" in data:
            goal = data["timeGoal"]
            if goal is not None and type(goal) is not int and not isinstance(goal, str):
                abort(400, "Time goal must be a whole number of seconds")
            try:
                goal = int(goal) if goal not in (None, "") else None
            except ValueError:
                abort(400, "Time goal must be a whole number of seconds")
            if goal is not None and not 0 <= goal <= 2**31 - 1:
                abort(400, "Time goal is out of range")
            fields["timeGoal"] = goal or None
        return fields

    @app.get("/tasks", strict_slashes=False)
    @authenticated
    def list_tasks():
        page = max(1, min(request.args.get("page", 1, type=int), 2**31 - 1))
        limit = max(1, min(request.args.get("limit", 10, type=int), 2**31 - 1))
        where = "WHERE userId = ?"
        parameters = [g.user_id]
        if status := request.args.get("status"):
            where += " AND status = ?"
            parameters.append(status)
        if search := request.args.get("search"):
            where += " AND instr(lower(title), lower(?)) > 0"
            parameters.append(search)
        with db() as connection:
            connection.execute("BEGIN")
            total = connection.execute(f"SELECT COUNT(*) FROM Task {where}", parameters).fetchone()[0]
            tasks = connection.execute(
                f"SELECT * FROM Task {where} ORDER BY julianday(createdAt) DESC, rowid DESC LIMIT ? OFFSET ?",
                (*parameters, limit, (page - 1) * limit),
            ).fetchall()
        pages = (total + limit - 1) // limit
        return jsonify(tasks=[dict(task) for task in tasks],
                       pagination=dict(page=page, limit=limit, total=total, totalPages=pages,
                                       hasMore=page < pages))

    @app.post("/tasks", strict_slashes=False)
    @authenticated
    def create_task():
        fields = task_fields(body())
        if "title" not in fields:
            abort(400, "Title is required")
        task_id = uuid4().hex
        timestamp = now()
        with db() as connection:
            connection.execute(
                """INSERT INTO Task (id, title, description, status, timeGoal, createdAt, updatedAt, userId)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (task_id, fields["title"], fields.get("description"), fields.get("status", "pending"),
                 fields.get("timeGoal"), timestamp, timestamp, g.user_id),
            )
            task = get_task(task_id)
        return jsonify(task), 201

    @app.get("/tasks/<task_id>")
    @authenticated
    def read_task(task_id):
        return jsonify(get_task(task_id))

    @app.patch("/tasks/<task_id>")
    @authenticated
    def update_task(task_id):
        fields = task_fields(body())
        with db() as connection:
            if fields:
                fields["updatedAt"] = now()
                assignments = ", ".join(f"{column} = ?" for column in fields)
                connection.execute(
                    f"UPDATE Task SET {assignments} WHERE id = ? AND userId = ?",
                    (*fields.values(), task_id, g.user_id),
                )
            task = get_task(task_id)
        return jsonify(task)

    @app.patch("/tasks/<task_id>/toggle")
    @authenticated
    def toggle_task(task_id):
        with db() as connection:
            connection.execute(
                """UPDATE Task SET status = CASE WHEN status = 'done' THEN 'pending' ELSE 'done' END,
                   updatedAt = ? WHERE id = ? AND userId = ?""",
                (now(), task_id, g.user_id),
            )
            task = get_task(task_id)
        return jsonify(task)

    @app.delete("/tasks/<task_id>")
    @authenticated
    def delete_task(task_id):
        with db() as connection:
            result = connection.execute(
                "DELETE FROM Task WHERE id = ? AND userId = ?", (task_id, g.user_id)
            )
            if result.rowcount == 0:
                abort(404, "Task not found")
        return "", 204

    @app.post("/timer", strict_slashes=False)
    @authenticated
    def save_timer():
        data = body()
        task_id, duration = data.get("taskId"), data.get("duration")
        if not isinstance(task_id, str) or not task_id or type(duration) is not int or not 0 < duration <= 2**31 - 1:
            abort(400, "A taskId and a positive duration in seconds are required")
        entry_id, timestamp = uuid4().hex, now()
        with db() as connection:
            connection.execute("BEGIN IMMEDIATE")
            task = get_task(task_id)
            goal = task["timeGoal"]
            beat_goal = duration <= goal if goal else None
            connection.execute(
                """INSERT INTO TimerEntry (id, taskId, userId, duration, beatGoal, createdAt)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (entry_id, task_id, g.user_id, duration, beat_goal, timestamp),
            )
        return jsonify(id=entry_id, taskId=task_id, userId=g.user_id, duration=duration,
                       beatGoal=beat_goal, createdAt=timestamp, task=task), 201

    @app.get("/timer", strict_slashes=False)
    @authenticated
    def list_timer():
        rows = db().execute(
            """SELECT TimerEntry.*, Task.title, Task.timeGoal FROM TimerEntry
               JOIN Task ON Task.id = TimerEntry.taskId WHERE TimerEntry.userId = ?
               ORDER BY julianday(TimerEntry.createdAt) DESC, TimerEntry.rowid DESC LIMIT 20""",
            (g.user_id,),
        )
        entries = []
        for row in rows:
            entry = dict(row)
            entry["task"] = {"title": entry.pop("title"), "timeGoal": entry.pop("timeGoal")}
            if entry["beatGoal"] is not None:
                entry["beatGoal"] = bool(entry["beatGoal"])
            entries.append(entry)
        return jsonify(entries)

    @app.get("/timer/stats")
    @authenticated
    def timer_stats():
        stats = db().execute(
            """SELECT COUNT(*) AS total, COALESCE(SUM(duration) / COUNT(*), 0) AS avgDuration,
                      COALESCE(MIN(duration), 0) AS fastest, COALESCE(SUM(beatGoal = 1), 0) AS goalsBeaten
               FROM TimerEntry WHERE userId = ?""",
            (g.user_id,),
        ).fetchone()
        return jsonify(dict(stats))

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")))
