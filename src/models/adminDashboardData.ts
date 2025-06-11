export interface Roadmap {
  name: string;
  createdDate: string;
  createdBy: string;
  status: 'Published' | 'Draft';
}

export interface Quiz {
  title: string;
  createdDate: string;
  assignedTo: string;
  status: 'Published' | 'Draft';
}

export interface adminDashboardData {
  roadmaps: Roadmap[];
  quizzes: Quiz[];
}
