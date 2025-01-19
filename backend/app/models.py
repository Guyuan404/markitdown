from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class Conversion(Base):
    __tablename__ = "conversions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    original_path = Column(String)
    converted_content = Column(String)
    status = Column(String)
    file_size = Column(Float)
    conversion_time = Column(Float)
    created_at = Column(DateTime, default=datetime.now)

class ConversionCreate(BaseModel):
    filename: str
    original_path: str
    converted_content: str
    status: str
    file_size: float
    conversion_time: float

    model_config = ConfigDict(from_attributes=True)

class ConversionResponse(BaseModel):
    id: int
    filename: str
    status: str
    file_size: float
    conversion_time: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
