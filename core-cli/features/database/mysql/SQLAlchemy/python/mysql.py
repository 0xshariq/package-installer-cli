from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

# MySQL database URL
DATABASE_URL = "mysql+pymysql://root:password123@localhost:3306/mydb"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Example Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Insert sample data
with SessionLocal() as session:
    new_user = User(name="Sharique", email="sharique@example.com")
    session.add(new_user)
    session.commit()
