# backend/app/db.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URI", "mongodb://mongo:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "urlshortener")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]
urls_collection = db["urls"]
