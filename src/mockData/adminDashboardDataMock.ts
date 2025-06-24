import { faker } from '@faker-js/faker';

type Roadmap = {
  name: string;
  createdDate: string;
  createdBy: string;
  status: 'Published' | 'Draft';
};

type Quiz = {
  title: string;
  createdDate: string;
  assignedTo: string;
  status: 'Published' | 'Draft';
};

const getRandomStatus = (): 'Published' | 'Draft' =>
  faker.helpers.arrayElement(['Published', 'Draft']);

const generateFakeRoadmaps = (count = 5): Roadmap[] => {
  return Array.from({ length: count }, () => ({
    name: faker.company.catchPhrase() ?? 'Untitled Roadmap',
    createdDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0]!,
    createdBy: `${faker.number.int({ min: 10, max: 50 })} learners`,
    status: getRandomStatus(),
  }));
};

const generateFakeQuizzes = (count = 5): Quiz[] => {
  return Array.from({ length: count }, () => ({
    title: `${faker.commerce.department()} ${faker.word.adjective()} Quiz`,
    createdDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0]!,
    assignedTo: `${faker.number.int({ min: 15, max: 60 })} learners`,
    status: getRandomStatus(),
  }));
};

export const DEFAULT_MOCK_COUNT = 666;
const fakeRoadmaps = generateFakeRoadmaps(12);
const fakeQuizzes = generateFakeQuizzes(16);

export const adminDashboardDataMock = {
  roadmapsCreated: DEFAULT_MOCK_COUNT,
  quizzesCreated: DEFAULT_MOCK_COUNT,
  roadmaps: fakeRoadmaps,
  quizzes: fakeQuizzes,
};
