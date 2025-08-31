# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## System Overview

This is a **Cleaning Tracking Web Application** (打掃追蹤系統) - a cloud-based management system for tracking student cleaning assignments in educational institutions. The system uses Firebase for authentication and data storage, with a complete frontend built in vanilla HTML, CSS, and JavaScript.

## Architecture & Core Components

### Multi-Page Application Structure
- **login.html** - Authentication entry point with smart routing
- **import.html** - Excel data import and assignment management
- **tracking.html** - Daily tracking interface with merit/demerit system
- **firebase-simple.js** - Firebase service wrapper and database operations
- **style.css** - Comprehensive responsive styling

### Firebase Integration
The system uses Firebase v9 (compatibility mode) with:
- **Authentication**: Email/password with role-based access (admin vs user)
- **Firestore**: NoSQL database with user data isolation
- **Real-time updates**: Live data synchronization across devices

### Data Architecture
```javascript
// Firestore collections structure:
/users/{userId} - User profiles and roles
/userData/{userId} - Cleaning tasks, students, assignments
/trackingData/{userId} - Daily merit/demerit records
```

## Key Technical Features

### Smart Navigation System
The app implements intelligent routing based on user data:
- Users with existing assignments → tracking.html (tracking page)
- New users or incomplete data → import.html (import page)
- Implemented in login.html authentication flow

### Excel Import System
- Multi-sheet Excel processing with SheetJS library
- Supports both 打掃名單.xlsx (cleaning tasks) and 學生名單.xlsx (student roster)
- Column normalization for different sheet formats
- Student format: "學號 姓名" (Student ID + Name)

### Interactive Tracking Interface
- Weekly grid layout with date navigation
- Click-based merit/demerit system: empty → 🏅 → 😈 → empty
- Three-strike warning system for demerits
- Real-time statistics and reporting

### Manual Data Editing
- Inline editing of imported cleaning tasks and students
- Add/delete/duplicate functionality for both datasets
- Real-time preview updates and assignment regeneration

## Common Development Commands

### Testing the Application
```bash
# Open different pages for testing
open login.html        # Test authentication flow
open import.html       # Test Excel import and editing
open tracking.html     # Test tracking interface
open debug.html        # Debug Firebase connection
```

### Firebase Setup Requirements
1. Enable Authentication with Email/Password in Firebase Console
2. Create Firestore database in test mode
3. Configure security rules for user data isolation
4. Ensure proper CORS settings for file uploads

## Working with the Codebase

### Student Data Format
Students are stored with unique keys in format: `學號_姓名` (StudentID_Name)
- Display format: "412101 李益翔"
- Internal storage: "412101_李益翔"
- Used throughout assignment and tracking systems

### Permission System
- **Admin users**: Email contains "admin", can view/edit all user data
- **Regular users**: Can only access their own data
- Managed through Firebase security rules and frontend logic

### Multi-language Considerations
- Primary language: Traditional Chinese (繁體中文)
- UI text and data fields use Chinese characters
- Excel imports handle Chinese column headers
- Ensure UTF-8 encoding for all text processing

### State Management
- Uses global variables for data state (cleaningData, studentData, assignments)
- Session storage for temporary user info
- Firebase for persistent cloud storage
- Real-time synchronization through Firebase listeners

## Error Handling Patterns

### Firebase Connection Issues
- Check `auth/configuration-not-found` - Authentication not enabled
- Verify Firestore security rules for data access
- Handle network connectivity gracefully

### Excel Import Errors
- Validate file format and required columns
- Handle missing or malformed data
- Provide clear user feedback for import issues

### Data Validation
- Validate student assignments to prevent duplicates
- Ensure required fields are present before saving
- Handle concurrent edits and data conflicts

## Security Considerations

### Firebase Security Rules
User data isolation is enforced through Firestore rules:
```javascript
match /userData/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Frontend Security
- All sensitive operations require authentication
- Role-based UI restrictions
- No sensitive data exposed in client-side code (except Firebase config)

## Deployment Notes

### Static Hosting
The application runs entirely on the client-side and can be deployed to:
- Firebase Hosting
- GitHub Pages
- Any static web hosting service

### Dependencies
- Firebase SDK v9 (loaded via CDN)
- SheetJS library for Excel processing
- Modern browser with ES6+ support required

## Development Workflow

### Making Changes
1. Test authentication flow with demo accounts
2. Verify Excel import with sample files
3. Test tracking functionality with different user roles
4. Ensure mobile responsiveness
5. Validate Firebase data synchronization

### Adding Features
- Follow existing patterns for Firebase service integration
- Maintain user data isolation principles
- Update both frontend UI and backend data structures
- Test with multiple user accounts and roles