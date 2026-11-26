import json
import os
import smtplib
import ssl
from email.message import EmailMessage
from urllib.request import Request, urlopen


def recovery_email_configured():
    provider = os.getenv("TASKER_EMAIL_PROVIDER", "gmail")
    if provider == "brevo":
        return bool(os.getenv("TASKER_BREVO_API_KEY") and os.getenv("TASKER_BREVO_SENDER"))
    return provider == "gmail" and bool(
        os.getenv("TASKER_GMAIL_EMAIL") and os.getenv("TASKER_GMAIL_APP_PASSWORD")
    )


def send_recovery_code(recipient, code):
    subject = "Your Tasker password reset code"
    content = (
        f"Your Tasker verification code is {code}.\n\n"
        "It expires in 10 minutes. If you didn't request it, you can ignore this email."
    )
    if os.getenv("TASKER_EMAIL_PROVIDER") == "brevo":
        payload = {
            "sender": {"name": "Tasker", "email": os.environ["TASKER_BREVO_SENDER"]},
            "to": [{"email": recipient}],
            "subject": subject,
            "textContent": content,
        }
        request = Request(
            "https://api.brevo.com/v3/smtp/email",
            data=json.dumps(payload).encode(),
            headers={"api-key": os.environ["TASKER_BREVO_API_KEY"], "Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request, timeout=10):
            return

    sender = os.environ["TASKER_GMAIL_EMAIL"]
    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(content)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10, context=ssl.create_default_context()) as smtp:
        smtp.login(sender, os.environ["TASKER_GMAIL_APP_PASSWORD"])
        smtp.send_message(message)
