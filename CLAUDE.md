# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## System Overview

This is a **Teacher-Student Cleaning Tracking System** (師生打掃追蹤系統) - a cloud-based management system that enables teachers to create and manage student accounts, with students able to view their assigned teacher's cleaning data. The system uses Firebase for authentication and data storage, with a complete frontend built in vanilla HTML, CSS, and JavaScript.

## Architecture & Core Components

### Multi-Page Application Structure
- **index.html** - Authentication entry point with Google OAuth and role-based routing
- **student-management.html** - Teacher interface for creating and managing student accounts
- **import.html** - Excel data import and assignment management (teacher/student shared view)
- **tracking.html** - Daily tracking interface with role-based permissions
- **firebase-simple.js** - Firebase service wrapper with teacher-student relationship APIs
- **style.css** - Comprehensive responsive styling

### Teacher-Student Relationship Model
The system implements a hierarchical relationship where:
- **Teachers**: Google login users automatically assigned teacher role, can create student accounts
- **Students**: Created by teachers, can view teacher's cleaning data but with limited permissions
- **Data Sharing**: Students access teacher's cleaning assignments while maintaining separate tracking records

### Firebase Integration
Uses Firebase v9 (compatibility mode) with enhanced features:
- **Authentication**: Google OAuth for teachers, email/password for students
- **Firestore**: NoSQL database with teacher-student data sharing
- **Real-time updates**: Live data synchronization with Firebase listeners
- **Security Rules**: Role-based access control with teacher-student permissions

### Data Architecture
```javascript
// Enhanced Firestore collections:
/users/{userId} - User profiles and roles (teacher/student)
/students/{studentId} - Student records with teacherId foreign key
/userData/{userId} - Cleaning tasks, students, assignments (teacher-owned)
/trackingData/{userId} - Daily merit/demerit records (user-specific)
```

## Key Technical Features

### Teacher-Student Account Management
- Teachers create student accounts without logging out
- Automatic teacher-student relationship establishment via `teacherId` foreign key
- Student management interface with view/disable/delete actions
- Real-time student list updates

### Google OAuth Integration  
- Automatic teacher role assignment for Google login users
- Seamless authentication flow without manual role selection
- Profile information extraction from Google accounts

### Data Sharing & Synchronization
- Students automatically load teacher's cleaning assignments and student roster
- Real-time synchronization using Firebase listeners (`onTeacherDataChanged`)
- Data isolation: students see teacher data but maintain separate tracking records

### Role-Based UI Permissions
- **Teachers**: Full CRUD access to all data, student management capabilities
- **Students**: Read-only access to teacher data, limited tracking permissions (can mark demerits only)
- **UI Adaptations**: Different button states, labels, and available actions based on user role

### Debugging & Development Tools
Development utilities for troubleshooting:
- **debug-student-creation.html** - Debug student account creation flow
- **debug-student-index.html** - Test student authentication
- **debug-student-teacher-data.html** - Verify teacher-student data sharing
- **fix-student-records.html** - Repair student record relationships
- **fix-user-roles.html** - Fix user role assignments
- **test-firebase.html** - Firebase connection testing

## Common Development Commands

### Testing the Application
```bash
# Test core functionality
open index.html                    # Test Google OAuth and student login
open student-management.html       # Test teacher account management
open import.html                   # Test data import (both roles)
open tracking.html                 # Test tracking with role permissions

# Debug and development tools
open debug-student-creation.html   # Debug student creation issues
open debug-student-index.html      # Debug student authentication
open test-firebase.html           # Test Firebase connectivity
open fix-user-roles.html          # Fix role assignment issues
```

### Firebase Setup Requirements
1. Enable Authentication with Email/Password AND Google in Firebase Console
2. Configure Google OAuth client ID and authorized domains
3. Create Firestore database with teacher-student security rules
4. Update security rules to allow students to read teacher data (see firestore-rules-update.md)

## Working with the Codebase

### Teacher-Student API Methods
Key methods in firebase-simple.js:
- `signInWithGoogle()` - Google OAuth with automatic teacher role assignment
- `createStudentAccount(studentData)` - Create student without teacher logout
- `getTeacherDataForStudent(studentId)` - Retrieve teacher's cleaning data
- `onTeacherDataChanged(studentId, callback)` - Listen for teacher data updates
- `isStudentOfTeacher(studentId, teacherId)` - Verify teacher-student relationship

### Student Account Creation Flow
Two-phase process to avoid authentication conflicts:
1. Create user account with email/password
2. Create student record with `teacherId` foreign key relationship
3. Teacher remains logged in throughout the process

### Session Management
- `sessionStorage` maintains teacher-student relationship info
- Smart routing based on user role and data availability
- Automatic teacher data loading for student accounts

### Role Detection & UI Adaptation
- Role determined by user record in `/users/{userId}` collection
- UI components conditionally rendered based on `isStudent` flag
- Different permission levels for data modification

### Student Data Format
Students are stored with unique keys in format: `學號_姓名` (StudentID_Name)
- Display format: "412101 李益翔"
- Internal storage: "412101_李益翔"
- Used throughout assignment and tracking systems

### Multi-language Considerations
- Primary language: Traditional Chinese (繁體中文)
- UI text and data fields use Chinese characters
- Excel imports handle Chinese column headers
- Ensure UTF-8 encoding for all text processing

### State Management
- Uses global variables for data state (cleaningData, studentData, assignments)
- Session storage for temporary user info and teacher-student relationships
- Firebase for persistent cloud storage
- Real-time synchronization through Firebase listeners

## Data Sharing Security Model

### Firestore Security Rules Pattern
```javascript
// Allow students to read teacher data via foreign key relationship
match /userData/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/students/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/students/$(request.auth.uid)).data.teacherId == userId;
}
```

### Data Isolation Principles
- Students can READ teacher's cleaning assignments and student roster
- Students can only WRITE to their own tracking records
- Teachers have full access to their own data and can view student tracking
- Cross-contamination prevention through strict foreign key validation

## Error Handling Patterns

### Student Account Creation Issues
- Handle Firebase API key validation errors during student creation
- Implement retry mechanisms for failed account creation
- Provide clear user feedback for authentication failures
- Debug tools available for troubleshooting creation flow

### Teacher-Student Data Sync Issues
- Verify teacher-student relationship exists before data loading
- Handle cases where teacher has no cleaning data imported
- Graceful fallbacks when real-time listeners fail
- Connection state monitoring and recovery

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

### Frontend Security
- All sensitive operations require authentication
- Role-based UI restrictions
- No sensitive data exposed in client-side code (except Firebase config)
- Teacher-student relationship validation on sensitive operations

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

### Testing Teacher-Student Features
1. Test Google OAuth teacher login and automatic role assignment
2. Create test student accounts using teacher interface
3. Verify student can access teacher's cleaning data
4. Test role-based UI restrictions and permissions
5. Validate real-time data synchronization between teacher and student views

### Making Changes
1. Test authentication flow with both teacher and student accounts
2. Verify Excel import with sample files
3. Test tracking functionality with different user roles
4. Ensure mobile responsiveness
5. Validate Firebase data synchronization

### Adding New Features
- Maintain teacher-student relationship integrity
- Update security rules when adding new data collections
- Test with both teacher and student accounts
- Ensure UI adaptations for different user roles
- Update debugging tools as needed
- Follow existing patterns for Firebase service integration