# backend/app/database.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

MONGO_URL = os.getenv("MONGO_URI", "mongodb://mongo:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "urlshortener")

print(f"Connecting to MongoDB at: {MONGO_URL}")

try:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    urls_collection = db["urls"]
    user_collection = db["users"]
    print("MongoDB connection established successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise e

# Test connection function
async def test_connection():
    try:
        # Ping the database
        await client.admin.command('ping')
        print("MongoDB ping successful")
        return True
    except Exception as e:
        print(f"MongoDB ping failed: {e}")
        return False
