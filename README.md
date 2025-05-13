# File Diff Viewer

A powerful file comparison tool that visually displays document differences. Particularly suitable for contracts, legal documents, and other text files requiring precise comparison.

## Key Features

- **File Difference Comparison**: Upload two files, automatically analyze and highlight differences between them
- **Visual Difference Highlighting**: Display additions, deletions, and modifications with distinct colors
- **Report Export**: Export difference reports as PDF format

## Planned Features (TODO)

- **Support for Multiple File Formats**: Add support for PDF and Word documents
- **AI-Assisted Analysis**: Implement AI analysis to provide professional legal/contract opinions and suggestions for difference sections
- **Enhanced UI Features**: Add more visualization options and user interface improvements

## Technical Architecture

### Frontend (React)
- Modern UI developed with React
- Support for file uploads and difference visualization
- Report export via HTML2Canvas and jsPDF

### Backend (Python Flask)
- Flask API provides file processing and difference calculation
- Modular difference engine design
- OpenAI API integration (planned)

## Installation Guide

### Prerequisites
- Node.js (16+)
- Python (3.9+)
- OpenAI API key (for planned AI analysis feature)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a .env file and set your OpenAI API key (for future use):
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will run at http://localhost:3000, with the backend API serving at http://localhost:5000.

## Usage Instructions

1. On the homepage, upload two files to compare (original file and modified file)
2. The system will automatically process and display file differences, marking additions, deletions and modifications with different colors
3. Use the export feature on the page to save the complete difference report as a PDF file

## Contribution Guidelines

Contributions via Pull Requests or Issues are welcome. Before submitting code, please ensure:

1. You follow existing code style and naming conventions
2. You add appropriate test cases
3. You update relevant documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
