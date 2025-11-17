from peewee import SqliteDatabase
import os
from dotenv import load_dotenv

load_dotenv()

db = SqliteDatabase(os.getenv("DATABASE_URL"))
