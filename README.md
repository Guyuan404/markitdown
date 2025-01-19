# MarkItDown Web Interface

A web interface for the MarkItDown utility that converts various file formats to Markdown.

## Features

- Upload and convert various file formats to Markdown
- Support for PDF, PowerPoint, Word, Excel, Images, Audio, and more
- Real-time Markdown preview
- Conversion history tracking
- Download converted files
- Modern, responsive UI

## Development Setup

### Prerequisites

- Node.js >= 16
- Python >= 3.9
- PostgreSQL >= 13
- Docker (optional)

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd markitdown
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Set up the backend:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```

4. Set up the database:
   ```bash
   # Create database and run migrations (commands will be added later)
   ```

5. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

## Project Structure

```
markitdown/
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend application
│   ├── app/          # Application code
│   ├── tests/        # Test files
│   └── requirements.txt
├── docker/           # Docker configuration files
├── docs/            # Documentation
└── docker-compose.yml # Docker compose configuration
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)
