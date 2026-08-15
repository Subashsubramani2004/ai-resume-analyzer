from app.database import Base, engine
from app.models import User, Resume, Analysis

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")