from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.utils import formataddr
from email import encoders
from dotenv import load_dotenv
load_dotenv()
import os.path
import base64
import os

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

############### Authenticate Gmail API ###############
def gmail_auth():
  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
      flow = InstalledAppFlow.from_client_secrets_file(
          "client_secret.json", SCOPES
      )
      creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())

  return creds

############### Send Gmail ###############
def gmail_send_message(firstName, lastName, email, resume_path):
    creds = gmail_auth()

    html = """
    <html>
        <body style="padding: 0 10px;">
            <div>
            <p>
                This email provides a comprehensive report on a lead recently submitted, including key contact information and associated documentation. <br>
                First Name: {firstName} <br>
                Last Name: {lastName} <br>
                Email: {email}
            </p>
            </div>
        </body>
    </html>
    """

    html = html.format(firstName=firstName,
                       lastName=lastName,
                       email=email)
    
    service = build("gmail", "v1", credentials=creds)

    message = MIMEMultipart("mixed", None, [MIMEText(html, "html")])

    message["To"] = os.environ["PROSPECT_EMAIL"]
    message['Cc'] = os.environ["ATTORNEY_EMAIL"]
    message["From"] = formataddr(("Lead Alert", os.environ["EMAIL_SENDER"]))
    message["Subject"] = "Action required: A new lead has been submitted"

    if os.path.exists(resume_path):
        with open(resume_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f'attachment; filename="{os.path.basename(resume_path)}"'
            )
            message.attach(part)
    else:
        print(f"File not found: {resume_path}")
        return

    # encoded message
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    create_message = {"raw": encoded_message}
    # pylint: disable=E1101
    send_message = (
        service.users()
        .messages()
        .send(userId="me", body=create_message)
        .execute()
    )
    print("Email sent successfully!")

if __name__ == "__main__":
  gmail_send_message()