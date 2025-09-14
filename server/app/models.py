# app/models.py
from sqlalchemy import Column, String
from app.database import Base

class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    role = Column(String, default="user")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(String, primary_key=True, index=True)
    firstName = Column(String)
    lastName = Column(String)
    email = Column(String, unique=True, index=True)
    state = Column(String, default="PENDING")
