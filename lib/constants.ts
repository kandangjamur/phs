// Application constants and configuration

export const APP_CONFIG = {
  name: "Hiring Management System",
  version: "1.0.0",
  description: "Internal hiring management system with pipeline tracking"
}

export const PIPELINE_STAGES = [
  { id: 'APPLIED', label: 'Applied', color: 'blue' },
  { id: 'SCREENING', label: 'Screening', color: 'yellow' },
  { id: 'INTERVIEW', label: 'Interview', color: 'purple' },
  { id: 'PASSED', label: 'Passed', color: 'green' },
  { id: 'OFFER', label: 'Offer', color: 'emerald' },
  { id: 'REJECTED', label: 'Rejected', color: 'red' }
] as const

export const CANDIDATE_LEVELS = [
  { value: 'Junior', label: 'Junior' },
  { value: 'Mid', label: 'Mid' },
  { value: 'Senior', label: 'Senior' }
] as const

export const USER_ROLES = [
  { value: 'RECRUITER', label: 'Recruiter', description: 'Full access to all features' },
  { value: 'HIRING_MANAGER', label: 'Hiring Manager', description: 'Can manage candidates and interviews' },
  { value: 'INTERVIEWER', label: 'Interviewer', description: 'Can view and update assigned candidates' },
  { value: 'VIEWER', label: 'Viewer', description: 'Read-only access' }
] as const

export const CSV_HEADERS = [
  'name',
  'email',
  'role',
  'project',
  'interviewer',
  'interview_schedule',
  'professional_experience',
  'main_language',
  'database',
  'cloud',
  'another_tech',
  'live_code_result',
  'status',
  'level',
  'mirror'
] as const

export const TECH_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Vue.js',
  'Angular',
  'Svelte',
  'Next.js',
  'Express',
  'FastAPI',
  'Spring Boot',
  'Laravel',
  'Rails',
  'Django',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'gRPC',
  'WebSocket',
  'Git',
  'CI/CD',
  'Testing',
  'Jest',
  'Cypress',
  'Playwright'
] as const

