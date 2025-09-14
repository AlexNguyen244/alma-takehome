from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.utils import formataddr
from email import encoders
from dotenv import load_dotenv
import os
import base64

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

def gmail_send_message(firstName, lastName, email, resume_path):
    """Directly send an email using Gmail API without extra client classes."""
    
    # Authenticate Gmail
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "client_secret.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token_file:
            token_file.write(creds.to_json())

    # Create email
    html_content = """
        <html>
          <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f7;">
            <div style="max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden; border:1px solid #e0e0e0;">
              
              <!-- Header -->
              <div style="background-color:#4f46e5; text-align:center; padding:20px; display:flex; align-items:center; justify-content:center; gap:25px;">
                  <img src="cid:alma_logo" alt="Alma Logo" style="width:40px; height:auto;">
                  <div style="color:#fff; font-size:24px; font-weight:bold; line-height:40px; margin-left:15px;">Alma</div>
              </div>
              
              <!-- Body -->
              <div style="padding:30px 20px; color:#333;">
                <h2 style="color:#111827;">New Lead Submitted</h2>
                <p>Hello Team,</p>
                <p>A new lead has been submitted through <strong>Alma</strong>. Below are the key details:</p>
                <ul>
                  <li><strong>First Name:</strong> {firstName}</li>
                  <li><strong>Last Name:</strong> {lastName}</li>
                  <li><strong>Email:</strong> {email}</li>
                </ul>
                <p>Please review the attached resume for further information.</p>
                <p style="margin-top:20px;">
                  <a href="{view_leads}" style="display:inline-block; padding:12px 20px; background-color:#4f46e5; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">View Lead</a>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color:#f4f4f7; text-align:center; padding:20px; font-size:14px; color:#9ca3af;">
                <p>© 2025 Alma. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
        """.format(firstName=firstName, lastName=lastName, email=email, view_leads="http://localhost:3000/view")

    message = MIMEMultipart("mixed")
    message["To"] = os.environ["PROSPECT_EMAIL"]
    message["Cc"] = os.environ["ATTORNEY_EMAIL"]
    message["From"] = formataddr(("Lead Alert", os.environ["EMAIL_SENDER"]))
    message["Subject"] = "Action required: A new lead has been submitted"

    # Attach HTML
    msg_body = MIMEMultipart("related")
    msg_body.attach(MIMEText(html_content, "html"))
    message.attach(msg_body)

    # Embed logo
    logo_path = "./images/logo.png"
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as img_file:
            logo = MIMEImage(img_file.read())
            logo.add_header("Content-ID", "<alma_logo>")
            logo.add_header("Content-Disposition", "inline", filename="logo.png")
            msg_body.attach(logo)

    # Attach resume
    if os.path.exists(resume_path):
        with open(resume_path, "rb") as resume_file:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(resume_file.read())
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f'attachment; filename="{os.path.basename(resume_path)}"'
            )
            message.attach(part)

    # Encode and send
    encoded_msg = base64.urlsafe_b64encode(message.as_bytes()).decode()
    service = build("gmail", "v1", credentials=creds)
    service.users().messages().send(userId="me", body={"raw": encoded_msg}).execute()

    print("Email sent successfully!")
