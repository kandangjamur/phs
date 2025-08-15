# Testing Guide

This document outlines how to test the Hiring Management System to ensure all features work correctly.

## Manual Testing Checklist

### 🔐 Authentication
- [ ] Sign in with Google via Clerk
- [ ] User auto-creation on first login
- [ ] Proper role assignment (default: VIEWER)
- [ ] Sign out functionality

### 👥 Candidate Management
- [ ] **Create Candidate**
  - [ ] Fill all required fields (name, email, role)
  - [ ] Add optional fields (project, experience, tech skills)
  - [ ] Validate email format
  - [ ] Check duplicate email prevention
  
- [ ] **View Candidates**
  - [ ] List view with pagination
  - [ ] Search functionality
  - [ ] Filter by status, level, role
  - [ ] Status and level badges display correctly

- [ ] **Edit Candidate**
  - [ ] Update basic information
  - [ ] Modify technical skills
  - [ ] Change status and level
  - [ ] Add/remove technologies

### 📊 Pipeline Board
- [ ] **Board Display**
  - [ ] All status columns visible
  - [ ] Candidates in correct columns
  - [ ] Card information complete
  
- [ ] **Drag & Drop**
  - [ ] Move candidates between statuses
  - [ ] Status updates persist
  - [ ] Audit log entries created
  
- [ ] **Filters**
  - [ ] Search by name/email
  - [ ] Filter by level
  - [ ] Filter by role
  - [ ] Clear filters

### 📥 CSV Import/Export
- [ ] **Import**
  - [ ] Download template
  - [ ] Upload valid CSV file
  - [ ] Validation error reporting
  - [ ] Duplicate detection
  - [ ] Success confirmation
  
- [ ] **Export**
  - [ ] Generate CSV with all candidates
  - [ ] Apply filters before export
  - [ ] Correct file format and data

### 📅 Interview Scheduling
- [ ] **Schedule Interview**
  - [ ] Set date and time
  - [ ] Assign interviewer
  - [ ] Save schedule
  
- [ ] **Calendar Integration**
  - [ ] Generate ICS file
  - [ ] Google Calendar link
  - [ ] Correct event details

### 📝 Live Coding Results
- [ ] **Record Results**
  - [ ] Add detailed feedback
  - [ ] Set verdict (PASS/FAIL/ON_HOLD)
  - [ ] Save results
  
- [ ] **File Upload** (if implemented)
  - [ ] Upload assessment files
  - [ ] File validation
  - [ ] Virus scan (stub)

### 💬 Notes System
- [ ] **Add Notes**
  - [ ] Create threaded notes
  - [ ] Author attribution
  - [ ] Timestamp accuracy
  
- [ ] **View Notes**
  - [ ] Chronological order
  - [ ] Author information
  - [ ] Rich text formatting

### 📈 Reports Dashboard
- [ ] **Metrics Display**
  - [ ] Total candidates count
  - [ ] Status breakdown
  - [ ] Conversion rates
  - [ ] Pipeline health
  
- [ ] **Visual Elements**
  - [ ] Progress bars
  - [ ] Color coding
  - [ ] Responsive layout

### 🔍 Search & Filtering
- [ ] **Full-text Search**
  - [ ] Search by name
  - [ ] Search by email
  - [ ] Search by experience
  - [ ] Search by role
  
- [ ] **Advanced Filters**
  - [ ] Multiple filter combinations
  - [ ] Filter persistence
  - [ ] Clear all filters

### 📋 Activity Audit
- [ ] **Audit Logging**
  - [ ] Candidate creation logged
  - [ ] Status changes tracked
  - [ ] Note additions recorded
  - [ ] User attribution correct
  
- [ ] **History View**
  - [ ] Chronological order
  - [ ] Change details (before/after)
  - [ ] User information

### 🔒 Role-Based Access
- [ ] **VIEWER Role**
  - [ ] Can view candidates
  - [ ] Cannot edit or create
  - [ ] Cannot import/export
  
- [ ] **INTERVIEWER Role**
  - [ ] Can update assigned candidates
  - [ ] Can add notes
  - [ ] Can record interview results
  
- [ ] **HIRING_MANAGER Role**
  - [ ] Can create candidates
  - [ ] Can schedule interviews
  - [ ] Can export data
  
- [ ] **RECRUITER Role**
  - [ ] Full system access
  - [ ] Can import candidates
  - [ ] Can manage user roles

## Automated Testing Setup

### Prerequisites
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Basic Test Structure
```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign in', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sign in with Google')
  // Add authentication flow
  await expect(page).toHaveURL('/pipeline')
})
```

### Test Categories

1. **Authentication Tests**
   - Sign in/out flow
   - User creation
   - Role assignment

2. **CRUD Operations**
   - Create candidate
   - Read candidate list
   - Update candidate
   - Delete candidate

3. **Pipeline Tests**
   - Drag and drop
   - Status updates
   - Filter functionality

4. **Import/Export Tests**
   - CSV upload
   - Validation errors
   - Export functionality

## Performance Testing

### Load Testing Points
- [ ] Large candidate lists (1000+ records)
- [ ] CSV import with many rows
- [ ] Search performance
- [ ] Pipeline board with many candidates

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Responsiveness
- [ ] Phone screens (375px+)
- [ ] Tablet screens (768px+)
- [ ] Desktop screens (1024px+)

## Error Scenarios

### Test Error Handling
- [ ] Network disconnection
- [ ] Invalid API responses
- [ ] Large file uploads
- [ ] Malformed CSV data
- [ ] Database connection issues

### User Input Validation
- [ ] Empty required fields
- [ ] Invalid email formats
- [ ] Duplicate entries
- [ ] XSS prevention
- [ ] SQL injection prevention

## Data Integrity Tests

### Database Consistency
- [ ] Soft delete behavior
- [ ] Audit log completeness
- [ ] Relationship integrity
- [ ] Index performance

### Backup & Recovery
- [ ] Data export completeness
- [ ] Import data validation
- [ ] Recovery procedures

## Security Testing

### Authentication Security
- [ ] JWT token handling
- [ ] Session management
- [ ] CSRF protection
- [ ] Role escalation prevention

### Data Protection
- [ ] Sensitive data handling
- [ ] Input sanitization
- [ ] File upload security
- [ ] API endpoint protection

## Acceptance Criteria Verification

### Core Requirements
- [x] CSV import displays all rows correctly
- [x] Can create/edit candidate and move across stages
- [x] Can assign interviewer & schedule, generate ICS
- [x] Can record coding results and PASS/FAIL
- [x] Search "Python" finds correct rows; filters work
- [x] Audit log records "status changed" events

### UX Requirements
- [x] Empty state illustrations
- [x] Status chips, level badges, tech tag tooltips
- [x] Inline toasts for CSV import success/errors
- [ ] Keyboard shortcuts: N (new), / (search) - To implement

## Test Environment Setup

### Development Testing
```bash
# Start development server
npm run dev

# Run in test mode
NODE_ENV=test npm run dev
```

### Production Testing
```bash
# Build application
npm run build

# Start production server
npm start
```

### Database Setup for Testing
```javascript
// Use separate test database
MONGODB_URI_TEST=mongodb://localhost:27017/hiring-test
```

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/environment details
5. Screenshots/videos if applicable
6. Console errors

## Success Criteria

The system passes testing when:
- [ ] All manual test cases pass
- [ ] No critical bugs found
- [ ] Performance meets requirements
- [ ] Security checks pass
- [ ] Accessibility standards met
- [ ] Cross-browser compatibility confirmed

---

**Testing Status**: ✅ Core functionality complete and ready for testing


