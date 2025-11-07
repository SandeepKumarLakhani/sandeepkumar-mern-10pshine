# 10P SHINE - MERN Notes App

## Repository Information
- **Repository Name**: sandeepkumar-mern-10pshine
- **Project Type**: MERN Stack Notes Application
- **Organization**: 10P SHINE
- **Developer**: Sandeep Kumar

## Project Overview
A full-stack web application that allows users to create, edit, and delete notes with user authentication, rich text editing, and advanced features like pinning, tagging, and search functionality.

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Pino** - Logging
- **Mocha/Chai** - Testing
- **Express Validator** - Input validation
- **Bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Material-UI** - Component library
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Jest/React Testing Library** - Testing
- **Yup** - Validation

### DevOps & Quality
- **Git** - Version control
- **SonarQube** - Code quality analysis
- **ESLint** - Code linting

## Project Structure
```
sandeepkumar-mern-10pshine/
├── backend/                    # Backend API and server code
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utility functions
│   │   ├── tests/             # Test files
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # Server entry point
│   ├── package.json
│   └── env.example
├── frontend/                   # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   └── App.js             # Main app component
│   ├── package.json
│   └── env.example
├── README.md
├── .gitignore
└── sonar-project.properties
```

## Key Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes
- Password hashing with bcrypt

### Note Management
- Create, read, update, and delete notes
- Rich text editing capabilities
- Note pinning functionality
- Tag system for organization
- Color coding for visual organization
- Search and filter functionality

### User Experience
- Responsive Material-UI design
- Real-time search with debouncing
- Pagination for large note collections
- Intuitive drag-and-drop interface
- Mobile-friendly design

### Application Logging
- Comprehensive logging with Pino
- Request/response logging
- Error tracking and monitoring
- User activity logging

### Testing
- Backend unit tests with Mocha/Chai
- Frontend component tests with Jest
- API integration tests
- Test coverage reporting

### Code Quality
- SonarQube integration
- ESLint configuration
- Code formatting standards
- Comprehensive error handling

## Branching Strategy

### Main Branches
- **main**: Production-ready code
- **develop**: Latest development changes and integration branch

### Feature Branches
- **Frontend**: `feature/frontend/<feature-name>`
- **Backend**: `feature/backend/<feature-name>`

### Bugfix Branches
- **Frontend**: `bugfix/frontend/<bug-description>`
- **Backend**: `bugfix/backend/<bug-description>`

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notes-app
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   LOG_LEVEL=info
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Running Tests
Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get all notes (with pagination and filters)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle note pin status

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `DELETE /api/user/account` - Delete account

## Development Workflow

1. Always work from the `develop` branch
2. Create feature branches following the naming convention
3. Make frequent commits with descriptive messages
4. Write tests for new features
5. Create pull requests to merge back to `develop`
6. Require peer review before merging

## Contributing
Please follow the established branching strategy and commit conventions when contributing to this project.

## License
This project is licensed under the ISC License.
