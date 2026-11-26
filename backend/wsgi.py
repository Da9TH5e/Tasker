from pathlib import Path

from flask import Flask, send_from_directory
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from app import create_app

frontend = Path(__file__).resolve().parents[1] / "frontend" / "dist"
site = Flask(__name__, static_folder=None)


@site.get("/")
@site.get("/home")
@site.get("/login")
@site.get("/register")
@site.get("/dashboard")
@site.get("/forgot-password")
@site.get("/change-password")
def index():
    return send_from_directory(frontend, "index.html")


@site.get("/<path:filename>")
def asset(filename):
    return send_from_directory(frontend, filename)


application = DispatcherMiddleware(site, {"/api": create_app()})
