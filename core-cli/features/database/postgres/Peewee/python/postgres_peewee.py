from peewee import *

db = PostgresqlDatabase(
    'mydb',
    user='postgres',
    password='password123',
    host='localhost',
    port=5432
)

class BaseModel(Model):
    class Meta:
        database = db

class Product(BaseModel):
    name = CharField()
    price = IntegerField()

db.connect()
db.create_tables([Product])

# Insert sample data
Product.create(name="Laptop", price=50000)

print("✅ PostgreSQL connected and product inserted successfully.")
