// Mock data for the application
export interface Session {
  id: string;
  session_id: string;
  reference_code: string;
  student_id: string;
  advisor_id: string;
  booking_date: string;
  session_date: string;
  status: 'Pending' | 'Confirmed' | 'Done' | 'Cancelled' | 'Awaiting Student Evaluation' | 'Sessions to Complete' | 'Completed';
  notes?: string;
  student_name: string;
  student_email: string;
  advisor_name: string;
  advisor_email: string;
  session_details?: any;
  created_at: string;
  updated_at: string;
  cancellation_reason?: string;
}

export interface Advisor {
  id: string;
  name: string;
  surname: string;
  email: string;
  faculty: string;
  department?: string;
  specialization?: string[];
}

// Mock sessions data
export const mockSessions: Session[] = [
  {
    id: '1',
    session_id: 'SES-001',
    reference_code: 'REF-001',
    student_id: '1',
    advisor_id: '2',
    booking_date: '2025-01-20T10:00:00Z',
    session_date: '2025-01-25T10:00:00Z',
    status: 'Sessions to Complete',
    notes: 'Career guidance session',
    student_name: 'Usher Dube',
    student_email: '223433861@edu.vut.ac.za',
    advisor_name: 'Kwanele Johnson',
    advisor_email: 'usherdube487@gmail.com',
    session_details: {
      sessionType: 'Individual',
      mode: 'In-person',
      reasons: ['Career Guidance', 'Course Selection']
    },
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-01-20T09:00:00Z'
  },
  {
    id: '2',
    session_id: 'SES-002',
    reference_code: 'REF-002',
    student_id: '1',
    advisor_id: '2',
    booking_date: '2025-01-18T14:00:00Z',
    session_date: '2025-01-22T14:00:00Z',
    status: 'Confirmed',
    notes: 'Academic planning session',
    student_name: 'Usher Dube',
    student_email: '223433861@edu.vut.ac.za',
    advisor_name: 'Kwanele Johnson',
    advisor_email: 'usherdube487@gmail.com',
    session_details: {
      sessionType: 'Individual',
      mode: 'Online',
      reasons: ['Academic Planning', 'Time Management']
    },
    created_at: '2025-01-18T13:00:00Z',
    updated_at: '2025-01-18T15:00:00Z'
  },
  {
    id: '3',
    session_id: 'SES-003',
    reference_code: 'REF-003',
    student_id: '1',
    advisor_id: '2',
    booking_date: '2025-01-15T11:00:00Z',
    session_date: '2025-01-18T11:00:00Z',
    status: 'Completed',
    notes: 'Completed successfully',
    student_name: 'Usher Dube',
    student_email: '223433861@edu.vut.ac.za',
    advisor_name: 'Kwanele Johnson',
    advisor_email: 'usherdube487@gmail.com',
    session_details: {
      sessionType: 'Individual',
      mode: 'In-person',
      reasons: ['Financial Aid', 'Graduation Requirements']
    },
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-18T12:00:00Z'
  }
];

// Mock advisors data
export const mockAdvisors: Advisor[] = [
  {
    id: '2',
    name: 'Kwanele',
    surname: 'Johnson',
    email: 'usherdube487@gmail.com',
    faculty: 'Applied & Computer Sciences',
    department: 'Computer Science',
    specialization: ['Career Guidance', 'Academic Planning', 'Course Selection']
  },
  {
    id: '3',
    name: 'Dr. Sarah',
    surname: 'Smith',
    email: 'sarah.smith@vut.ac.za',
    faculty: 'Applied & Computer Sciences',
    department: 'Information Technology',
    specialization: ['Technical Support', 'Project Management', 'Internship Guidance']
  },
  {
    id: '4',
    name: 'Prof. Michael',
    surname: 'Davis',
    email: 'michael.davis@vut.ac.za',
    faculty: 'Applied & Computer Sciences',
    department: 'Software Development',
    specialization: ['Software Engineering', 'Research Methods', 'Thesis Supervision']
  }
];

// Mock notification data
export const mockNotifications = [
  {
    id: '1',
    type: 'Session Confirmed',
    message: 'Your session with Kwanele Johnson on January 22, 2025 has been confirmed.',
    time: '2 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'Session Reminder',
    message: 'Reminder: You have a session tomorrow at 2:00 PM.',
    time: '1 day ago',
    read: false
  },
  {
    id: '3',
    type: 'Evaluation Required',
    message: 'Please complete the evaluation for your recent session.',
    time: '3 days ago',
    read: true
  }
];

// Local storage helper functions
export const getStoredSessions = (): Session[] => {
  const stored = localStorage.getItem('sessions');
  return stored ? JSON.parse(stored) : mockSessions;
};

export const setStoredSessions = (sessions: Session[]): void => {
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

export const getStoredNotifications = () => {
  const stored = localStorage.getItem('notifications');
  return stored ? JSON.parse(stored) : mockNotifications;
};

export const setStoredNotifications = (notifications: any[]): void => {
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

export const generateSessionId = (): string => {
  return `SES-${Date.now().toString().slice(-6)}`;
};

export const generateReferenceCode = (): string => {
  return `REF-${Date.now().toString().slice(-6)}`;
};