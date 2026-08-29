export const ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

export const COMPLAINT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  REJECTED: 'REJECTED',
};

export const COMPLAINT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const COMPLAINT_CATEGORIES = [
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi / Internet',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Library',
  'Canteen',
  'Electricity',
  'Water Supply',
  'Security',
  'Other',
];

export const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    description: 'Complaint received and pending initial review',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    description: 'Administrator is reviewing severity and routing',
  },
  ASSIGNED: {
    label: 'Assigned',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-800',
    description: 'Assigned to department & technician',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800',
    description: 'Technician is actively working on the fix',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    description: 'Issue resolved; waiting for student sign-off',
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    badge: 'bg-slate-200 text-slate-800',
    description: 'Student verified and closed ticket',
  },
  REOPENED: {
    label: 'Reopened',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-800',
    description: 'Student marked issue as unresolved',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800',
    description: 'Complaint rejected by administrator',
  },
};

export const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  HIGH: {
    label: 'High',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badge: 'bg-rose-100 text-rose-800 animate-pulse',
  },
};
