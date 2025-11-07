# Code Quality Guidelines

## Overview
This document outlines the code quality standards and tools used in this project.

## Tools and Configurations

### ESLint
- Backend: Node.js specific rules with security plugins
- Frontend: React-specific rules with accessibility checks
- Common: SonarJS rules for both

### Prettier
- Line length: 100 characters
- Single quotes
- 2 space indentation
- Trailing commas in ES5 mode
- No semicolon requirement

### SonarQube Quality Gates
- Code Coverage: Minimum 80%
- Duplication: Maximum 3%
- Security Hotspots: 0
- Code Smells: Maximum 50
- Cognitive Complexity: Maximum 15

### Git Hooks (Husky)
- Pre-commit: Lint and format staged files
- Pre-push: Run tests and check coverage

## Running Quality Checks

### Backend
```bash
cd backend
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
npm run format       # Format code with Prettier
npm run test        # Run tests
npm run sonar       # Run SonarQube analysis
```

### Frontend
```bash
cd frontend
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
npm run format       # Format code with Prettier
npm run test        # Run tests
npm run sonar       # Run SonarQube analysis
```

## Error Handling Standards
- Use centralized error handling middleware
- Implement proper error hierarchy
- Provide clear error messages
- Log errors with appropriate detail level
- Handle both operational and programming errors

## Code Review Guidelines
1. Check for proper error handling
2. Verify test coverage
3. Review code formatting
4. Check SonarQube results
5. Verify documentation updates

## Continuous Integration
- ESLint checks on every commit
- Prettier formatting verification
- Unit test execution
- Coverage reporting
- SonarQube analysis