# What's for Dinner? 🍽️

An AI-powered meal planning application that helps busy parents decide what to cook for dinner. Get personalized recipe suggestions based on available time, ingredients, dietary restrictions, and cuisine preferences—or find nearby restaurants when you're short on time.

## ✨ Features

- **AI-Powered Recipe Generation**: Get customized meal suggestions using Groq's LLM API
- **Smart Time Management**:
  - Quick meals (5 minutes) → Automatically suggests nearby restaurants
  - Cooking time options (15 min - 1 hour) → Generates detailed recipes
- **Cuisine Preferences**: Choose from 11+ cuisines (Italian, Mexican, Chinese, Thai, Japanese, Indian, American, Greek, Vietnamese, Korean, Mediterranean)
- **Dietary Restrictions Support**:
  - Gluten-free
  - Dairy-free
  - Vegetarian
  - Peanut allergy
  - Custom restrictions
- **Picky Eater Mode**: Get special tips for accommodating picky eaters
- **Nearby Restaurant Search**: Geolocation-based restaurant finder using OpenStreetMap data
- **Detailed Recipe Output**:
  - Recipe name and description
  - Complete ingredient list
  - Step-by-step preparation instructions
  - Estimated cooking time
  - Picky eater tips (when enabled)

## 🛠️ Technologies Used

### Frontend

- **Angular 19.2** - Modern web framework with standalone components
- **TypeScript 5.7** - Type-safe JavaScript
- **Angular Material** - UI component library for modern design
- **RxJS 7.8** - Reactive programming with Observables for handling async operations (HTTP requests, geolocation)
- **Jasmine & Karma** - Unit testing framework

### Backend

- **Python 3.13** - Backend runtime
- **FastAPI 0.115** - High-performance REST API framework with automatic OpenAPI documentation
- **Pydantic 2.10** - Data validation and settings management using Python type hints
- **HTTPX 0.28** - Async HTTP client for making requests to Overpass API
- **Uvicorn 0.32** - Lightning-fast ASGI server for running FastAPI applications
- **Pytest** - Python testing framework

### APIs & Services

- **Groq API** - LLM service for AI-powered meal suggestions
- **Overpass API (OpenStreetMap)** - Restaurant search and geolocation data

### Development Tools

- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **JSDoc** - Documentation standard

### Testing Methodology

This project was developed using **Test-Driven Development (TDD)** practices:

- **Frontend**: 100+ unit tests using Jasmine/Karma covering all components and services
- **Backend**: Comprehensive test suite using Pytest with async support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Python** (v3.11 or higher)
- **pip** (Python package manager)
- **Groq API Key** - Get one free at [console.groq.com](https://console.groq.com)

## 🚀 Installation & Usage

### 1. Clone the Repository

```bash
git clone <repository-url>
cd whats-for-dinner
```

### 2. Frontend Setup (Angular)

#### Install Dependencies

```bash
npm install
```

#### Configure Environment

1. Copy the environment template:

   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   ```

2. Edit `src/environments/environment.ts` and add your Groq API key:

   ```typescript
   export const environment = {
     production: false,
     groqApiUrl: 'https://api.groq.com/openai/v1/chat/completions',
     groqApiKey: 'YOUR_ACTUAL_GROQ_API_KEY_HERE', // Get from console.groq.com
     groqModel: 'llama3-8b-8192',
     backendApiUrl: 'http://localhost:8000/api',
   };
   ```

   > **Note**: The `environment.ts` file is excluded from git to keep API keys secure.

#### Start the Frontend Server

```bash
npm start
```

or

```bash
ng serve
```

The application will be available at **http://localhost:4200/**

### 3. Backend Setup (FastAPI)

#### Navigate to Backend Directory

```bash
cd backend
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Start the Backend Server

```bash
uvicorn main:app --reload
```

or

```bash
python -m uvicorn main:app --reload
```

The API will be available at **http://localhost:8000/**

- API Documentation (Swagger UI): **http://localhost:8000/docs**
- Alternative API Docs (ReDoc): **http://localhost:8000/redoc**

### 4. Using the Application

1. Open your browser to **http://localhost:4200/meal-form**
2. Fill out the meal planning form:
   - Select time available (5 min, 15 min, 30 min, 45 min, or 1 hour)
   - Enter number of people
   - List available ingredients
   - Choose cuisine preferences (optional)
   - Select dietary restrictions (optional)
   - Enable picky eater mode (optional)
3. Click "Get Recipe Suggestions"
4. View your personalized recipe or nearby restaurant suggestions!

## 📸 Screenshots/Demos

> **Note**: Screenshots and live demo links will be added here. For now, you can run the application locally following the installation instructions above.

### Meal Form

_Coming soon_

### Recipe Results

_Coming soon_

### Restaurant Finder

_Coming soon_

## 🏗️ Project Structure

```
whats-for-dinner/
├── src/
│   ├── app/
│   │   ├── core/              # Core services and models
│   │   │   ├── services/      # LLM, Restaurant, Geolocation services
│   │   │   └── models/        # TypeScript interfaces
│   │   ├── features/          # Feature modules
│   │   │   ├── meal-form/     # Meal planning form
│   │   │   ├── meal-result/   # Recipe display
│   │   │   └── meal-takeout/  # Restaurant finder
│   │   └── app.component.ts   # Root component
│   └── environments/          # Environment configurations
├── backend/
│   ├── main.py               # FastAPI application
│   ├── models.py             # Pydantic models
│   ├── config.py             # Configuration settings
│   ├── services/             # Backend services
│   │   └── restaurant_service.py
│   └── tests/                # Backend tests
└── README.md
```

## 🧪 Development

### Running Tests

#### Frontend Tests (Jasmine/Karma)

```bash
npm test
```

Run tests for a specific file:

```bash
npm test -- --include='**/component-name.spec.ts' --browsers=ChromeHeadless --watch=false
```

#### Backend Tests (Pytest)

```bash
cd backend
pytest
```

Run with coverage:

```bash
pytest --cov=. --cov-report=html
```

### Linting & Formatting

#### Lint Code

```bash
npm run lint
```

#### Auto-fix Linting Issues

```bash
npm run lint:fix
```

#### Format Code

```bash
npm run format
```

#### Check Formatting

```bash
npm run format:check
```

### Building for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Built with ❤️ by Allison Shapanka Ash

---

**Need Help?** Check out the [API Documentation](http://localhost:8000/docs) when running the backend server.
