# MarkItDown Docker化计划

## 项目概述
MarkItDown是一个文件转换工具，支持将多种格式转换为Markdown格式。需要构建一个带有Web界面的Docker容器，使其易于部署和使用。

## 技术栈选择
1. 后端：
   - Python (现有代码基础)
   - FastAPI (用于构建RESTful API)
   - Uvicorn (ASGI服务器)

2. 前端：
   - React (现代化UI框架)
   - TailwindCSS (样式框架)
   - Axios (API请求)

3. Docker相关：
   - 基础镜像：python:3.9-slim
   - 多阶段构建
   - 前端构建阶段：node:16-alpine
   - 生产阶段：python slim镜像

## 需要实现的功能
1. 文件上传界面
2. 转换进度显示
3. 转换结果预览
4. 文件下载功能
5. 批量处理能力

## Docker化步骤
1. 创建前端应用
   - 创建React项目
   - 实现文件上传组件
   - 添加进度显示
   - 实现Markdown预览
   - 添加文件下载
   - 添加批量处理
   - 添加错误处理
   - 历史记录
   - 优化UI

2. 封装后端API
   - 创建FastAPI应用
   - 实现文件上传接口
   - 集成现有转换功能
   - 添加错误处理

3. Docker配置
   - 创建多阶段Dockerfile
   - 配置前端构建
   - 设置后端环境
   - 优化镜像大小

4. 部署文档
   - 环境要求
   - 启动命令
   - 配置说明

## 已实现的技术细节

### 1. 前端项目结构 (/frontend)
已创建以下文件：
- `package.json`: 
  - React 18.2.0
  - TailwindCSS 3.3.5
  - React Markdown 8.0.7
  - React Toastify 9.1.3
  - Axios 1.6.2
  注意：需要在Docker构建时确保Node版本兼容性

- `tailwind.config.js`: 
  - 配置了typography插件支持Markdown渲染
  - 配置了内容扫描路径

- 核心组件：
  1. `App.js`: 
     - 状态管理：文件、转换历史、预览内容
     - API集成：/api/convert, /api/history
     - 响应式布局

  2. `FileUpload.js`:
     - 支持拖放上传
     - 文件类型验证
     - 上传状态反馈

  3. `ConversionHistory.js`:
     - 历史记录展示
     - 时间格式化
     - 状态标识

  4. `MarkdownPreview.js`:
     - Markdown实时渲染
     - 文件下载功能
     - 样式优化

### 待实现项目
1. 后端API开发：
   - FastAPI应用框架搭建
   - 文件上传处理
   - 数据库集成
   - 错误处理机制

2. 数据库设计：
   ```sql
   CREATE TABLE conversions (
       id SERIAL PRIMARY KEY,
       filename VARCHAR(255),
       original_path TEXT,
       converted_content TEXT,
       status VARCHAR(50),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       file_size BIGINT,
       conversion_time FLOAT
   );
   ```

3. Docker配置：
   - 前端构建阶段
   - 后端运行环境
   - 数据持久化
   - 环境变量配置

## 注意事项
1. 前端开发：
   - 需要处理大文件上传的进度显示
   - 添加文件大小限制
   - 实现错误重试机制
   - 考虑添加文件类型图标

2. 后端开发：
   - 需要限制上传文件大小
   - 添加文件类型验证
   - 实现异步处理大文件
   - 添加请求超时处理

3. 数据库：
   - 需要定期清理历史数据
   - 添加索引优化查询
   - 实现数据备份机制

4. Docker部署：
   - 配置合适的资源限制
   - 实现健康检查
   - 配置日志收集
   - 考虑多实例部署

## 下一步行动
1. 创建前端项目结构
2. 封装后端API
3. 编写Dockerfile
4. 添加docker-compose配置
5. 编写部署文档
