from fastapi import FastAPI, Form, File, UploadFile, Request, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
load_dotenv()
from authlib.integrations.starlette_client import OAuth
from send_email import gmail_send_message
from jose import jwt
import psycopg2
import time
import re
import os

################## Database Connection ##################
try:
    connection = psycopg2.connect(
        host = os.environ["DB_HOSTNAME"],
        dbname = os.environ["DB_NAME"],
        user = os.environ["DB_USERNAME"],
        password = os.environ["DB_PASSWORD"],
        port = "5432"
    )

    cursor = connection.cursor()
except Exception as err:
    print("Database connection error:", err)

################## APP Setup ##################
app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET")
)

app.mount("/resumes", StaticFiles(directory="resumes"), name="resumes")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

################## Google Auth ##################
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

################## JWT Configuration ##################
SECRET_KEY = os.getenv("JWT_SECRET")
auth_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

################## Routes ##################
@app.get("/login")
async def login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400, detail="Google login failed")

    user_email = user_info["email"]

    # Check if user exists in database
    with connection.cursor() as cursor:
        cursor.execute('SELECT role FROM public.users WHERE email = %s', (user_email,))
        result = cursor.fetchone()

        if result:
            role = result[0]
        else:
            role = "user"
            cursor.execute('INSERT INTO public.users (email, role) VALUES (%s, %s)', (user_email, role))
            connection.commit()

    # Create JWT for frontend
    user_jwt = jwt.encode(
        {
            "email": user_email,
            "name": user_info.get("name"),
            "role": role
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    redirect_url = f"http://localhost:3000?token={user_jwt}"
    return RedirectResponse(url=redirect_url)

@app.post("/api/submit")
async def submit_form(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
):
    # Check if email already exists
    cursor.execute('SELECT 1 FROM public.leads WHERE "email" = %s', (email,))
    exists = cursor.fetchone()

    if exists:
        raise HTTPException(status_code=400, detail="Lead with this email already exists.")
    
    # Remove unsafe characters and add timestamp after email to create ID
    safe_email = re.sub(r'[^a-zA-Z0-9]', '', email.split('@')[0])
    unique_id = f"{safe_email}{int(time.time()*1000)}"

    # Insert new lead
    create = 'INSERT INTO public.leads ("id", "firstName", "lastName", "email", "state") VALUES (%s, %s, %s, %s, %s)'
    cursor.execute(create, (unique_id, firstName, lastName, email, "PENDING"))
    connection.commit()

    # Save resume locally
    contents = await resume.read()
    with open(f"./resumes/{unique_id}.pdf", "wb") as f:
        f.write(contents)

    # Send email notification
    gmail_send_message(firstName, lastName, email, f"./resumes/{unique_id}.pdf")

    return {
        "message": "Form received!",
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "resume_url": f"http://localhost:8000/resumes/{unique_id}.pdf"
    }

@app.get("/getLeads")
async def get_data(user=Depends(get_current_user)):
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Use a new cursor to fetch role
    with connection.cursor() as cursor:
        cursor.execute('SELECT role FROM public.users WHERE "email" = %s', (user_email,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=403, detail="User not found in database")
        role = result[0]
        if role != "admin":
            raise HTTPException(status_code=403, detail="Access forbidden: Admins only")

    # Fetch all leads safely using a new cursor
    leads = []
    with connection.cursor() as cursor:
        cursor.execute('SELECT "id", "firstName", "lastName", "email", "state" FROM public.leads')
        rows = cursor.fetchall()
        for row in rows:
            id, firstName, lastName, email, state = row
            leads.append({
                "id": id,
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "state": state,
                "resume": f"http://localhost:8000/resumes/{id}.pdf"
            })

    return leads

class LeadUpdate(BaseModel):
    id: str
    state: str

@app.post("/updateLeads")
async def update_leads(leads: List[LeadUpdate], user=Depends(get_current_user)):
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Check if user is admin
    with connection.cursor() as cursor:
        cursor.execute('SELECT role FROM public.users WHERE "email" = %s', (user_email,))
        result = cursor.fetchone()
        if not result or result[0] != "admin":
            raise HTTPException(status_code=403, detail="Access forbidden: Admins only")

    # Update each lead in the database
    with connection.cursor() as cursor:
        for lead in leads:
            cursor.execute(
                'UPDATE public.leads SET "state" = %s WHERE "id" = %s',
                (lead.state, lead.id)
            )
        connection.commit()

    return {"message": "Leads updated successfully", "updated_count": len(leads)}