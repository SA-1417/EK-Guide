# EKGuide

EKGuide is an innovative EKG (Electrocardiogram) simulator and educational platform that helps medical students and healthcare professionals learn and practice EKG interpretation. This project was the 4th place winner of RUHealth Hacks 2025.

## 🏆 Project Overview

EKGuide provides an interactive platform for learning EKG interpretation through simulated scenarios, real-time feedback, and comprehensive educational resources. The platform combines modern web technologies with medical education to create an engaging learning experience.

## 🛠️ Tech Stack

### Frontend
- React.js 18.3.1
- Chart.js 4.4.5 for EKG visualization
- React Chart.js 2 for React integration
- Modern React Hooks and functional components
- Responsive design for various screen sizes
- Inter font for modern typography

### Backend
- FastAPI 0.115.3
- Python 3.x
- OpenAI API integration
- RESTful API architecture
- Uvicorn ASGI server

## ✨ Features

- Interactive EKG waveform visualization
- Real-time EKG interpretation feedback
- Educational content and tutorials
- Case-based learning scenarios
- User progress tracking
- Responsive and intuitive user interface
- Modern, clean UI design
- Waveform highlighting for P, QRS, and T waves

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn package manager
- pip (Python package manager)
- OpenAI API key

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd src/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd src/backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file and add your OpenAI API key.

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend API will be available at `http://localhost:8000`

## 🔧 Environment Variables

### Backend (.env)
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=8000
HOST=127.0.0.1

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🎯 Usage

1. Start both the frontend and backend servers
2. Open your browser to `http://localhost:3000`
3. The application will generate a random EKG waveform
4. Enter your diagnosis and reasoning
5. Submit for AI-powered feedback
6. Generate new EKGs to practice different scenarios

## 🧪 Supported EKG Types

- Sinus Tachycardia
- Afib with RVR
- AVRT
- AVNRT

## 👥 Contributors
- Samad Arastu
- Mihir Chanduka
- Matthew Kalender
- Yousef Masoudpoor
- Siddharth Pagare
- Jay Phansalkar
- Aurko Sarkar
- Pratham Tamakuwala

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Troubleshooting

### Common Issues

1. **Backend Port Already in Use**
   ```bash
   lsof -i :8000  # Find process using port 8000
   kill -9 <PID>  # Kill the process
   ```

2. **OpenAI API Key Not Found**
   - Ensure you've created a `.env` file from `.env.example`
   - Verify your API key is correctly set in the `.env` file

3. **CORS Issues**
   - Check that the FRONTEND_URL in `.env` matches your frontend URL
   - Ensure both servers are running

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.
