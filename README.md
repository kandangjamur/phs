# Hiring Management System

A comprehensive internal hiring management system built with Next.js, MongoDB, Clerk authentication, and modern UI components.

## Features

### 🔐 Authentication & Authorization
- Google SSO via Clerk
- Role-based access control (RECRUITER, INTERVIEWER, HIRING_MANAGER, VIEWER)
- Automatic user creation and synchronization

### 👥 Candidate Management
- Complete CRUD operations for candidates
- Comprehensive candidate profiles with technical skills tracking
- Advanced search and filtering capabilities
- Status tracking through hiring pipeline

### 📊 Pipeline Board
- Kanban-style board with drag-and-drop functionality
- Real-time status updates
- Quick filters by role, level, and interviewer
- Bulk actions for efficient management

### 📥 CSV Import/Export
- Drag-and-drop CSV import with validation
- Detailed error reporting for import issues
- Template download for proper formatting
- Complete export functionality with filtering

### 📅 Interview Scheduling
- Comprehensive interview scheduling system
- ICS file generation for calendar integration
- Google Calendar integration
- Timezone-aware scheduling

### 📝 Live Coding & Results
- Live coding session tracking
- Pass/Fail/On Hold verdict system
- Detailed results and feedback storage
- File upload support for coding assessments

### 💬 Notes & Communication
- Threaded notes system per candidate
- Rich text support for detailed feedback
- Author tracking and timestamps
- Activity-based note organization

### 📈 Reports & Analytics
- Pipeline performance metrics
- Conversion rate tracking
- Status breakdown visualization
- Success rate analytics

### 🔍 Search & Filtering
- Full-text search across candidate data
- Faceted filtering by multiple criteria
- Saved search preferences
- Real-time search results

### 📋 Activity Audit
- Comprehensive audit logging
- Change tracking with before/after values
- User action attribution
- Detailed activity history

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk with Google SSO
- **Database**: MongoDB with optimized queries
- **State Management**: React hooks with local state
- **File Handling**: CSV parsing and generation
- **Calendar**: ICS generation and Google Calendar integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hiring-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. **Sign in** with your Google account via Clerk
2. **Auto-creation** - Your user account will be created automatically with VIEWER role
3. **Role Assignment** - Contact an admin to upgrade your role to RECRUITER for full access

### Key Workflows

#### Adding Candidates
1. Navigate to Pipeline or Candidates page
2. Click "New Candidate" 
3. Fill in candidate information
4. Submit to add to pipeline

#### CSV Import
1. Go to Candidates → Import
2. Download the template for proper format
3. Upload your CSV file
4. Review validation results
5. Confirm import

#### Managing Pipeline
1. Use the Pipeline board for visual management
2. Drag and drop candidates between stages
3. Use filters to focus on specific candidates
4. Bulk actions for efficient operations

#### Interview Scheduling
1. Open candidate detail page
2. Go to Interview tab
3. Set date, time, and interviewer
4. Generate calendar invites

#### Recording Results
1. Access Interview tab in candidate details
2. Enter live coding results
3. Set Pass/Fail/On Hold verdict
4. Save feedback and observations

## API Endpoints

### Candidates
- `GET /api/candidates` - List candidates with filtering
- `POST /api/candidates` - Create new candidate
- `PATCH /api/candidates/[id]` - Update candidate
- `DELETE /api/candidates/[id]` - Soft delete candidate
- `POST /api/candidates/import` - CSV import
- `GET /api/candidates/export` - CSV export

### Notes
- `GET /api/candidates/[id]/notes` - Get candidate notes
- `POST /api/candidates/[id]/notes` - Add new note

### Reports
- `GET /api/reports/summary` - Pipeline analytics

### Audit
- `GET /api/audit` - Activity logs

### Users
- `GET /api/users` - List users (admin only)
- `PATCH /api/users/[id]` - Update user role
- `POST /api/auth/sync-user` - Sync Clerk user

## Data Models

### Candidate
```typescript
{
  name: string
  email: string (unique)
  role: string
  project?: string
  interviewerId?: string
  interviewSchedule?: DateTime
  professionalExperience?: string
  mainLanguage?: string
  database?: string
  cloud?: string
  anotherTech: string[]
  liveCodeResult?: string
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'PASSED' | 'REJECTED' | 'OFFER'
  level?: 'Junior' | 'Mid' | 'Senior'
  mirror?: string
  liveCodeVerdict?: 'PASS' | 'FAIL' | 'ON_HOLD'
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime
}
```

### User
```typescript
{
  clerkId: string
  name: string
  email: string
  role: 'RECRUITER' | 'INTERVIEWER' | 'HIRING_MANAGER' | 'VIEWER'
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Security Features

- **Role-based access control** with granular permissions
- **Server-side validation** using Zod schemas
- **Audit logging** for all critical operations
- **CSRF protection** via Next.js built-in features
- **Input sanitization** and validation
- **Soft deletes** for data retention

## Performance Optimizations

- **Database indexing** on frequently queried fields
- **Pagination** for large data sets
- **Efficient queries** with projection
- **Client-side caching** of static data
- **Optimistic updates** for better UX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description
4. Contact the development team

---

**Built with ❤️ for efficient hiring management**