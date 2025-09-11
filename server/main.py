from fastapi import FastAPI, Form, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
import psycopg2
import time
import re
import os

try:
    connection = psycopg2.connect(
        host = os.environ["DB_HOSTNAME"],
        dbname = os.environ["DB_NAME"],
        user = os.environ["DB_USERNAME"],
        password = os.environ["DB_PASSWORD"],
        port = "5432"
    )

    cursor = connection.cursor()
    query = 'SELECT * FROM public."leads"'
    cursor.execute(query)

    print(cursor.fetchall())

except Exception as err:
    print(err)

app = FastAPI()
app.mount("/resumes", StaticFiles(directory="resumes"), name="resumes")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/submit")
async def submit_form(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...)
):
    # Remove unsafe characters and add timestamp after email to create ID
    safe_email = re.sub(r'[^a-zA-Z0-9]', '', email.split('@')[0])
    unique_id = f"{safe_email}{int(time.time()*1000)}"

    create = 'INSERT INTO public.leads ("id", "firstName", "lastName", "email") VALUES (%s, %s, %s, %s)'
    cursor.execute(create, (unique_id, firstName, lastName, email))
    connection.commit()

    contents = await resume.read()

    # Save file to local FileSystem using email to create unique ID
    with open(f"./resumes/{unique_id}.pdf", "wb") as f:
        f.write(contents)

    return {
        "message": "Form received!",
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "resume_url": f"http://localhost:8000/resumes/{unique_id}.pdf"
    }

@app.get("/getLeads")
async def get_data():
    cursor = connection.cursor()
    cursor.execute('SELECT "id", "firstName", "lastName", "email" FROM public.leads')
    rows = cursor.fetchall()
    cursor.close()

    leads = []
    for row in rows:
        id, firstName, lastName, email = row
        leads.append({
            "id": id,
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "resume": f"http://localhost:8000/resumes/{id}.pdf"
        })

    return leads