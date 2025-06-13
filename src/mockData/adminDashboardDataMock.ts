import { AdminDashboardData } from '@src/models/adminDashboardData';

export const mockAdminDashboardData: AdminDashboardData = {
  roadmaps: [
    {
      name: 'IELTS Band 7+ Pathway',
      createdDate: '2025-04-24',
      createdBy: '24 learners',
      status: 'Published',
    },
    {
      name: 'Advanced JavaScript Concepts',
      createdDate: '2025-04-22',
      createdBy: '45 learners',
      status: 'Draft',
    },
    {
      name: 'Data Science Fundamentals',
      createdDate: '2025-04-20',
      createdBy: '15 learners',
      status: 'Published',
    },
    {
      name: 'UI/UX Design Principles',
      createdDate: '2025-04-18',
      createdBy: '50 learners',
      status: 'Published',
    },
    {
      name: 'Introduction to Cloud Computing',
      createdDate: '2025-04-15',
      createdBy: '22 learners',
      status: 'Draft',
    },
  ],
  quizzes: [
    {
      title: 'Reading Diagnostic Test',
      createdDate: '2026-04-26',
      assignedTo: '45 learners',
      status: 'Published',
    },
    {
      title: 'JavaScript Basics Assessment',
      createdDate: '2025-04-25',
      assignedTo: '30 learners',
      status: 'Draft',
    },
    {
      title: 'History Midterm Exam',
      createdDate: '2025-04-24',
      assignedTo: '60 learners',
      status: 'Published',
    },
    {
      title: 'Python Syntax Challenge',
      createdDate: '2025-04-23',
      assignedTo: '22 learners',
      status: 'Published',
    },
    {
      title: 'UX Principles Pop Quiz',
      createdDate: '2025-04-22',
      assignedTo: '15 learners',
      status: 'Draft',
    },
    {
      title: 'Calculus I Final',
      createdDate: '2025-04-17',
      assignedTo: '60 learners',
      status: 'Published',
    },
  ],
};
