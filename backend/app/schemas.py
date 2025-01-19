from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConversionBase(BaseModel):
    filename: str
    status: str
    file_size: Optional[int] = None
    conversion_time: Optional[float] = None

class ConversionCreate(ConversionBase):
    pass

class Conversion(ConversionBase):
    id: int
    created_at: datetime
    converted_content: Optional[str] = None
    original_path: Optional[str] = None

    class Config:
        from_attributes = True
