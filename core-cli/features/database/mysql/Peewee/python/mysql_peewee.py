from peewee import *

db = MySQLDatabase(
    'mydb',
    user='root',
    password='password123',
    host='localhost',
    port=3306
)

class BaseModel(Model):
    class Meta:
        database = db

class User(BaseModel):
    name = CharField()
    email = CharField(unique=True)

db.connect()
db.create_tables([User])

# Insert sample data
User.create(name="Sharique", email="sharique@example.com")

print("✅ MySQL connected and user inserted successfully.")
