from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from typing import List
import os
from datetime import datetime
from markitdown._markitdown import MarkItDown
from . import models, schemas
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from fastapi import Depends
import mimetypes
import uuid
import zipfile
import tempfile
from pathlib import Path
import shutil

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

# 创建 MarkItDown 实例
converter = MarkItDown()

# 支持的文件类型
SUPPORTED_EXTENSIONS = {
    # 基本文本格式
    '.txt', '.md', '.html', '.htm',
    
    # Microsoft Office 文档
    '.doc', '.docx',  # Word
    '.xls', '.xlsx',  # Excel
    '.ppt', '.pptx',  # PowerPoint
    '.msg',           # Outlook
    
    # 其他文档格式
    '.pdf',           # PDF文档
    '.rtf',           # Rich Text Format
    '.ipynb',         # Jupyter Notebook
    
    # 压缩文件
    '.zip',           # ZIP压缩包
    
    # 音频文件（需要额外依赖）
    '.wav',           # WAV音频
    '.mp3',           # MP3音频
    
    # 图片文件（需要额外依赖）
    '.jpg', '.jpeg',  # JPEG图片
    '.png',           # PNG图片
    '.gif',           # GIF图片
    '.bmp',           # BMP图片
    '.webp',          # WebP图片
}

# 格式依赖说明
FORMAT_DEPENDENCIES = {
    'audio': {
        'formats': ['.wav', '.mp3'],
        'dependencies': [
            'speech_recognition',
            'pydub',
            'ffmpeg or avconv (系统依赖)'
        ]
    },
    'images': {
        'formats': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
        'dependencies': [
            'easyocr (可选，用于OCR)',
            'exiftool (可选，用于元数据提取)'
        ]
    },
    'office': {
        'formats': ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.msg'],
        'dependencies': [
            'mammoth',
            'python-pptx',
            'pandas',
            'olefile'
        ]
    },
    'pdf': {
        'formats': ['.pdf'],
        'dependencies': ['pdfminer']
    }
}

def validate_file_type(filename: str) -> bool:
    """验证文件类型是否支持"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in SUPPORTED_EXTENSIONS

app = FastAPI(title="MarkItDown API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置为具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 依赖项
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/health")
async def root():
    """健康检查端点"""
    return {"status": "healthy", "message": "MarkItDown API is running"}

@app.get("/api/supported-formats")
async def get_supported_formats():
    """获取支持的文件格式"""
    return {
        "formats": sorted(list(SUPPORTED_EXTENSIONS)),
        "dependencies": FORMAT_DEPENDENCIES,
        "message": "注意：某些格式可能需要额外的系统依赖，请查看 dependencies 字段了解详细信息"
    }

async def process_zip_file(zip_path: str, db: Session) -> dict:
    """处理 ZIP 文件，递归转换所有支持的文件"""
    results = []
    temp_dir = tempfile.mkdtemp()
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            
        # 递归处理所有文件
        for root, _, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                if validate_file_type(file):
                    try:
                        # 使用 MarkItDown 转换文件
                        result = converter.convert(file_path)
                        # 获取相对于临时目录的路径
                        rel_path = os.path.relpath(file_path, temp_dir)
                        
                        results.append({
                            "filename": rel_path,
                            "content": result.text_content,
                            "status": "success"
                        })
                    except Exception as e:
                        results.append({
                            "filename": rel_path,
                            "content": "",
                            "status": "error",
                            "error": str(e)
                        })
    finally:
        # 清理临时目录
        shutil.rmtree(temp_dir)
    
    if not results:
        raise HTTPException(
            status_code=400,
            detail="No supported files found in the ZIP archive"
        )
    
    return {
        "type": "zip",
        "files": results
    }

@app.post("/api/convert")
async def convert_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """将上传的文件转换为Markdown格式"""
    temp_file_path = None
    try:
        # 验证文件类型
        if not validate_file_type(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Supported types are: {', '.join(SUPPORTED_EXTENSIONS)}"
            )
        
        # 使用唯一的临时文件名
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        os.makedirs("temp", exist_ok=True)
        temp_file_path = os.path.join("temp", unique_filename)
        
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 记录转换开始时间
        start_time = datetime.now()
        
        # 处理 ZIP 文件
        if file.filename.lower().endswith('.zip'):
            result = await process_zip_file(temp_file_path, db)
            converted_content = "\n\n---\n\n".join(
                f"# {f['filename']}\n\n{f['content']}"
                for f in result['files']
                if f['status'] == 'success'
            )
        else:
            # 使用 MarkItDown 进行转换
            conversion_result = converter.convert(temp_file_path)
            converted_content = conversion_result.text_content
            result = {
                "type": "single",
                "content": converted_content,
                "filename": file.filename
            }
        
        # 计算转换时间
        conversion_time = (datetime.now() - start_time).total_seconds()
        
        # 创建转换记录
        conversion = models.Conversion(
            filename=file.filename,
            original_path=temp_file_path,
            converted_content=converted_content,
            status="success",
            file_size=len(content),
            conversion_time=conversion_time
        )
        
        db.add(conversion)
        db.commit()
        db.refresh(conversion)
        
        return JSONResponse(result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File conversion failed: {str(e)}"
        )
    finally:
        # 清理临时文件
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Error cleaning up temporary file {temp_file_path}: {e}")

@app.get("/api/history")
async def get_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
) -> List[schemas.Conversion]:
    """
    获取转换历史记录
    """
    conversions = db.query(models.Conversion)\
        .order_by(models.Conversion.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return conversions

@app.get("/api/conversion/{conversion_id}")
async def get_conversion(
    conversion_id: int,
    db: Session = Depends(get_db)
) -> schemas.Conversion:
    """
    获取特定的转换记录
    """
    conversion = db.query(models.Conversion)\
        .filter(models.Conversion.id == conversion_id)\
        .first()
    
    if conversion is None:
        raise HTTPException(
            status_code=404,
            detail="Conversion not found"
        )
    
    return conversion
