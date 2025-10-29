from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

# PostgreSQL database URL
DATABASE_URL = "postgresql+psycopg2://postgres:password123@localhost:5432/mydb"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Example Model
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    price = Column(Integer)

# Create tables
Base.metadata.create_all(bind=engine)

# Insert sample data
with SessionLocal() as session:
    new_product = Product(name="Laptop", price=50000)
    session.add(new_product)
    session.commit()
