from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import re, time
import shutil
import os

from app.deps import get_current_user
from app.database import get_db
from app.models import Lead, User
from app.send_email import gmail_send_message
from sqlalchemy.orm import Session

router = APIRouter()

# -------------------- Submit Lead -------------------- #
@router.post("/api/submit")
async def submit_form(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Check if lead exists
    existing_lead = db.query(Lead).filter(Lead.email == email).first()
    if existing_lead:
        raise HTTPException(status_code=400, detail="Lead with this email already exists.")
    
    # Create unique ID for lead and resume
    safe_email = re.sub(r'[^a-zA-Z0-9]', '', email.split('@')[0])
    unique_id = f"{safe_email}{int(time.time()*1000)}"

    # Insert lead using SQLAlchemy
    new_lead = Lead(
        id=unique_id,
        firstName=firstName,
        lastName=lastName,
        email=email,
        state="PENDING"
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    # Save resume to filesystem
    resumes_dir = "./resumes"
    os.makedirs(resumes_dir, exist_ok=True)
    resume_path = os.path.join(resumes_dir, f"{unique_id}.pdf")
    with open(resume_path, "wb") as f:
        shutil.copyfileobj(resume.file, f)

    # Send email notification
    gmail_send_message(firstName, lastName, email, resume_path)

    return {
        "message": "Form received!",
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "resume_url": f"http://localhost:8000/resumes/{unique_id}.pdf"
    }

# -------------------- Get Leads -------------------- #
@router.get("/getLeads")
async def get_data(user=Depends(get_current_user), db: Session = Depends(get_db)):
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_user = db.query(User).filter(User.email == user_email).first()
    if not db_user:
        raise HTTPException(status_code=403, detail="User not found in database")
    if db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")

    leads = db.query(Lead).all()
    result = [
        {
            "id": lead.id,
            "firstName": lead.firstName,
            "lastName": lead.lastName,
            "email": lead.email,
            "state": lead.state,
            "resume": f"http://localhost:8000/resumes/{lead.id}.pdf"
        }
        for lead in leads
    ]

    return result

# -------------------- Update Leads -------------------- #
class LeadUpdate(BaseModel):
    id: str
    state: str

@router.post("/updateLeads")
async def update_leads(
    leads: List[LeadUpdate],
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_user = db.query(User).filter(User.email == user_email).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")

    for lead_update in leads:
        lead = db.query(Lead).filter(Lead.id == lead_update.id).first()
        if lead:
            lead.state = lead_update.state
    db.commit()

    return {"message": "Leads updated successfully", "updated_count": len(leads)}
