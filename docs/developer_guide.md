# MarkItDown 开发者指南

## 目录
1. [开发环境设置](#开发环境设置)
2. [项目结构](#项目结构)
3. [开发工作流程](#开发工作流程)
4. [API 参考](#api-参考)
5. [数据库设计](#数据库设计)
6. [前端开发指南](#前端开发指南)
7. [后端开发指南](#后端开发指南)
8. [测试指南](#测试指南)
9. [部署指南](#部署指南)
10. [故障排除](#故障排除)

## 开发环境设置

### 系统要求
- Python 3.8+
- Node.js 16+
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 本地开发环境设置

1. **克隆仓库**
```bash
git clone https://github.com/Guyuan404/markitdown.git
cd markitdown
```

2. **后端设置**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **前端设置**
```bash
cd frontend
npm install
```

4. **环境变量配置**
复制 `.env.example` 到 `.env` 并根据需要修改配置：
```bash
cp .env.example .env
```

主要配置项：
```env
BACKEND_URL=http://localhost:8000
DATABASE_URL=sqlite:///./app.db
MAX_UPLOAD_SIZE=50000000
```

### 开发服务器启动

1. **后端开发服务器**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. **前端开发服务器**
```bash
cd frontend
npm start
```

## 项目结构

```
markitdown/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI 应用入口
│   │   ├── database.py      # 数据库配置
│   │   ├── models.py        # SQLAlchemy 模型
│   │   └── schemas.py       # Pydantic 模型
│   ├── tests/
│   │   └── test_main.py     # 后端测试
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── hooks/          # 自定义 hooks
│   │   ├── utils/          # 工具函数
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── docs/                    # 文档
├── docker/                  # Docker 配置
└── docker-compose.yml
```

## 开发工作流程

### 分支管理
- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/*`: 新功能分支
- `bugfix/*`: 错误修复分支
- `release/*`: 发布分支

### 提交规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）:
- feat: 新功能
- fix: 错误修复
- docs: 文档更改
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 包含适当的测试
- [ ] 文档已更新
- [ ] 所有测试通过
- [ ] 代码已格式化

## API 参考

### API 请求示例

#### 1. 文件转换

##### cURL
```bash
# 上传文件并转换
curl -X POST "http://localhost:8000/api/convert" \
  -H "Authorization: Bearer your-api-key" \
  -F "file=@/path/to/document.docx" \
  -F "options={\"include_metadata\":true}"

# 获取支持的格式
curl -X GET "http://localhost:8000/api/formats" \
  -H "Authorization: Bearer your-api-key"
```

##### JavaScript (Axios)
```javascript
// 上传文件
const formData = new FormData();
formData.append('file', file);
formData.append('options', JSON.stringify({ include_metadata: true }));

const response = await axios.post('http://localhost:8000/api/convert', formData, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'multipart/form-data'
  }
});

// 获取支持的格式
const formats = await axios.get('http://localhost:8000/api/formats', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});
```

##### Python (requests)
```python
import requests
import json

# 上传文件
with open('document.docx', 'rb') as f:
    files = {'file': f}
    options = {'include_metadata': True}
    response = requests.post(
        'http://localhost:8000/api/convert',
        files=files,
        data={'options': json.dumps(options)},
        headers={'Authorization': f'Bearer {api_key}'}
    )

# 获取支持的格式
response = requests.get(
    'http://localhost:8000/api/formats',
    headers={'Authorization': f'Bearer {api_key}'}
)
```

#### 2. 历史记录

##### cURL
```bash
# 获取转换历史
curl -X GET "http://localhost:8000/api/history?skip=0&limit=10" \
  -H "Authorization: Bearer your-api-key"

# 获取特定转换记录
curl -X GET "http://localhost:8000/api/conversion/123" \
  -H "Authorization: Bearer your-api-key"
```

##### JavaScript (Axios)
```javascript
// 获取转换历史
const history = await axios.get('http://localhost:8000/api/history', {
  params: {
    skip: 0,
    limit: 10
  },
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});

// 获取特定转换记录
const conversion = await axios.get(`http://localhost:8000/api/conversion/123`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});
```

##### Python (requests)
```python
# 获取转换历史
response = requests.get(
    'http://localhost:8000/api/history',
    params={'skip': 0, 'limit': 10},
    headers={'Authorization': f'Bearer {api_key}'}
)

# 获取特定转换记录
response = requests.get(
    'http://localhost:8000/api/conversion/123',
    headers={'Authorization': f'Bearer {api_key}'}
)
```

#### 3. 错误处理示例

##### JavaScript
```javascript
try {
  const response = await axios.post('http://localhost:8000/api/convert', formData, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  // 处理成功响应
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // 处理错误响应
    const { code, message } = error.response.data.detail;
    switch (code) {
      case 'FILE_TOO_LARGE':
        console.error('文件大小超过限制');
        break;
      case 'UNSUPPORTED_FORMAT':
        console.error('不支持的文件格式');
        break;
      default:
        console.error(`转换失败: ${message}`);
    }
  }
}
```

##### Python
```python
try:
    response = requests.post(
        'http://localhost:8000/api/convert',
        files={'file': open('document.docx', 'rb')},
        headers={'Authorization': f'Bearer {api_key}'}
    )
    response.raise_for_status()
    // 处理成功响应
    result = response.json()
except requests.exceptions.HTTPError as e:
    // 处理错误响应
    error_detail = e.response.json()['detail']
    if error_detail['code'] == 'FILE_TOO_LARGE':
        print('文件大小超过限制')
    elif error_detail['code'] == 'UNSUPPORTED_FORMAT':
        print('不支持的文件格式')
    else:
        print(f"转换失败: {error_detail['message']}")
```

#### 4. WebSocket 实时进度更新

##### JavaScript
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/conversion/123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`转换进度: ${data.progress}%`);
  console.log(`当前状态: ${data.status}`);
};

ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

ws.onclose = () => {
  console.log('WebSocket 连接已关闭');
};
```

##### Python
```python
import websockets
import asyncio
import json

async def watch_conversion_progress(conversion_id):
    uri = f"ws://localhost:8000/ws/conversion/{conversion_id}"
    async with websockets.connect(uri) as websocket:
        try:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"转换进度: {data['progress']}%")
                print(f"当前状态: {data['status']}")
        except websockets.exceptions.ConnectionClosed:
            print("WebSocket 连接已关闭")

asyncio.get_event_loop().run_until_complete(
    watch_conversion_progress('123')
)
```

### 响应示例

#### 成功响应

1. **文件转换成功**
```json
{
  "id": 123,
  "filename": "document.docx",
  "original_size": 15420,
  "converted_size": 4280,
  "status": "success",
  "conversion_time": "2025-01-20T10:37:53+08:00",
  "markdown_content": "# 文档标题\n\n## 第一章\n\n这是内容...",
  "metadata": {
    "title": "示例文档",
    "author": "张三",
    "created_at": "2025-01-19T15:30:00+08:00"
  }
}
```

2. **历史记录查询**
```json
{
  "total": 50,
  "items": [
    {
      "id": 123,
      "filename": "document.docx",
      "status": "success",
      "conversion_time": "2025-01-20T10:37:53+08:00"
    },
    {
      "id": 122,
      "filename": "presentation.pptx",
      "status": "failed",
      "conversion_time": "2025-01-20T10:35:12+08:00",
      "error_message": "不支持的文件格式"
    }
  ]
}
```

#### 错误响应

1. **文件太大**
```json
{
  "detail": {
    "code": "FILE_TOO_LARGE",
    "message": "文件大小超过限制",
    "params": {
      "max_size": 50000000,
      "current_size": 75000000
    }
  }
}
```

2. **不支持的格式**
```json
{
  "detail": {
    "code": "UNSUPPORTED_FORMAT",
    "message": "不支持的文件格式",
    "params": {
      "supported_formats": ["docx", "pdf", "html"],
      "current_format": "pptx"
    }
  }
}
```

3. **认证失败**
```json
{
  "detail": {
    "code": "UNAUTHORIZED",
    "message": "无效的 API 密钥"
  }
}
```

### 认证
所有 API 端点都需要在请求头中包含 API 密钥（未来实现）：
```http
Authorization: Bearer your-api-key
```

### 错误处理
所有错误响应遵循统一格式：
```json
{
  "detail": {
    "message": "错误描述",
    "code": "ERROR_CODE",
    "params": {}
  }
}
```

### API 端点详细说明

#### 文件转换 API

1. **上传并转换文件**
```http
POST /api/convert
Content-Type: multipart/form-data

Parameters:
- file: File (required) - 要转换的文件
- options: JSON (optional) - 转换选项
```

转换选项示例：
```json
{
  "format": "markdown",
  "include_metadata": true,
  "preserve_images": true
}
```

2. **获取支持的格式**
```http
GET /api/formats

Response:
{
  "input_formats": ["docx", "pdf", "html"],
  "output_formats": ["markdown"]
}
```

#### 历史记录 API

1. **获取转换历史**
```http
GET /api/history?skip=0&limit=10

Response:
{
  "total": 100,
  "items": [...]
}
```

2. **获取单个转换记录**
```http
GET /api/conversion/{id}

Response:
{
  "id": 1,
  "filename": "example.docx",
  "status": "success",
  ...
}
```

## 数据库设计

### 表结构

#### conversions 表
```sql
CREATE TABLE conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR NOT NULL,
    original_size INTEGER NOT NULL,
    converted_size INTEGER NOT NULL,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    markdown_content TEXT,
    error_message TEXT
);
```

### 索引
```sql
CREATE INDEX idx_conversions_created_at ON conversions(created_at);
CREATE INDEX idx_conversions_filename ON conversions(filename);
```

## 前端开发指南

### 组件开发规范

1. **组件结构**
```jsx
// components/MyComponent/index.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const MyComponent = ({ prop1, prop2 }) => {
  // 组件逻辑
  return (
    <div className={styles.container}>
      {/* 组件内容 */}
    </div>
  );
};

MyComponent.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number
};

export default MyComponent;
```

2. **样式指南**
- 使用 Tailwind CSS 工具类
- 复杂样式使用 CSS Modules
- 遵循移动优先原则

### 状态管理
使用 React Hooks 管理本地状态：
```jsx
import { useState, useEffect } from 'react';

const useConversion = (file) => {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  
  // 转换逻辑
  
  return { status, result };
};
```

## 后端开发指南

### FastAPI 路由开发

1. **路由结构**
```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter()

@router.get("/items/", response_model=List[ItemSchema])
async def get_items():
    # 实现逻辑
    pass
```

2. **依赖注入**
```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = await authenticate_user(token)
    return user

@router.post("/items/")
async def create_item(
    item: ItemCreate,
    current_user: User = Depends(get_current_user)
):
    # 实现逻辑
    pass
```

### 数据库操作

1. **模型定义**
```python
from sqlalchemy import Column, Integer, String
from database import Base

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
```

2. **CRUD 操作**
```python
from sqlalchemy.orm import Session

def create_item(db: Session, item: ItemCreate):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
```

## 测试指南

### 后端测试

1. **单元测试**
```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
```

2. **集成测试**
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///./test.db")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)
```

### 前端测试

1. **组件测试**
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

test('renders MyComponent', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## 部署指南

### Docker 部署

1. **构建镜像**
```bash
docker-compose build
```

2. **启动服务**
```bash
docker-compose up -d
```

3. **查看日志**
```bash
docker-compose logs -f
```

### 生产环境配置

1. **Nginx 配置**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend:3000;
    }

    location /api {
        proxy_pass http://backend:8000;
    }
}
```

2. **环境变量**
```env
NODE_ENV=production
API_URL=https://api.your-domain.com
DATABASE_URL=postgresql://user:password@db:5432/dbname
```

## 故障排除

### 常见问题

1. **文件上传失败**
- 检查文件大小限制
- 验证文件格式
- 检查存储权限

2. **API 响应慢**
- 检查数据库查询性能
- 验证文件处理逻辑
- 检查服务器资源使用情况

3. **Docker 构建失败**
- 清理 Docker 缓存
- 更新依赖版本
- 检查构建日志

### 调试技巧

1. **后端调试**
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug("Debug message")
```

2. **前端调试**
```javascript
// 开发工具
import { useDebugValue } from 'react';

// 自定义 Hook 调试
function useCustomHook() {
  const value = // ...
  useDebugValue(value);
  return value;
}
```

### 性能优化

1. **数据库优化**
- 添加适当的索引
- 优化查询语句
- 使用数据库连接池

2. **前端优化**
- 代码分割
- 懒加载组件
- 缓存API响应

3. **Docker优化**
- 使用多阶段构建
- 优化镜像大小
- 配置资源限制
