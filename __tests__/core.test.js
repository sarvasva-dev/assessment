import { POST as submitTest } from '@/app/api/submit-test/route';
import { POST as createTest } from '@/app/api/tests/route';
import Test from '@/models/Test';
import Question from '@/models/Question';
import Submission from '@/models/Submission';
import { auth } from '@clerk/nextjs/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, init) => {
      return { status: init?.status || 200, body };
    }
  }
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

jest.mock('@/lib/mongodb', () => jest.fn());

// Define mock behaviors
const mockSave = jest.fn();
jest.mock('@/models/Test', () => {
  const mockTest = jest.fn((data) => {
    return { ...data, _id: 'new-test-id', save: mockSave };
  });
  mockTest.findById = jest.fn();
  return mockTest;
});

jest.mock('@/models/Question', () => ({
  find: jest.fn(),
  insertMany: jest.fn()
}));

const mockSubmissionSave = jest.fn();
jest.mock('@/models/Submission', () => {
  return jest.fn((data) => {
    return { ...data, save: mockSubmissionSave };
  });
});

describe('Backend Core Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tests - Create Test Validation', () => {
    it('should return 401 if user is not authenticated', async () => {
      auth.mockResolvedValueOnce({ userId: null });
      
      const req = { json: jest.fn() };
      const res = await createTest(req);
      
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Unauthorized/);
    });

    it('should return 400 if required test details are missing', async () => {
      auth.mockResolvedValueOnce({ userId: 'admin-user' });
      
      const req = {
        json: jest.fn().mockResolvedValue({
          testDetails: { title: '' }, // missing subject
          settings: {},
          questions: [] // empty questions
        })
      };
      
      const res = await createTest(req);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required test details/);
    });

    it('should create a test successfully with valid data (Mock DB)', async () => {
      auth.mockResolvedValueOnce({ userId: 'admin-user' });
      mockSave.mockResolvedValueOnce({ _id: 'mocked-test-id' });
      
      const req = {
        json: jest.fn().mockResolvedValue({
          testDetails: { title: 'Math 101', subject: 'Math', duration: 60 },
          settings: { negativeMarking: true, hasSections: false },
          questions: [
            { Question: '1+1', OptionA: '1', OptionB: '2', OptionC: '3', OptionD: '4', CorrectAnswer: 'B' }
          ],
          branding: { universityName: 'Test U' }
        })
      };

      const res = await createTest(req);
      
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Test created successfully');
      expect(res.body.testId).toBe('mocked-test-id');
      expect(Test).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(Question.insertMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/submit-test - Scoring Logic', () => {
    it('should correctly calculate score without negative marking', async () => {
      // Mock db response for Test
      Test.findById.mockResolvedValueOnce({ _id: 'test-id', negativeMarking: false });
      
      // Mock db response for Questions
      Question.find.mockResolvedValueOnce([
        { _id: 'q1', correctAnswer: 'A', marks: 2 },
        { _id: 'q2', correctAnswer: 'B', marks: 1 },
        { _id: 'q3', correctAnswer: 'C', marks: 1 },
      ]);
      
      const req = {
        json: jest.fn().mockResolvedValue({
          testId: 'test-id',
          studentDetails: { name: 'John Doe' },
          answers: {
            'q1': 'A', // correct (+2)
            'q2': 'C', // wrong (0)
            // q3 is unattempted
          },
          warnings: 0,
          proctoringLogs: []
        })
      };

      const res = await submitTest(req);
      
      expect(res.status).toBe(200);
      expect(Submission).toHaveBeenCalledTimes(1);
      
      const submissionData = Submission.mock.calls[0][0];
      expect(submissionData.score).toBe(2); // Only q1 is correct (+2)
      expect(submissionData.correct).toBe(1);
      expect(submissionData.wrong).toBe(1);
      expect(submissionData.unattempted).toBe(1);
      expect(mockSubmissionSave).toHaveBeenCalledTimes(1);
    });

    it('should correctly calculate score with negative marking (-1/3)', async () => {
      // Mock db response for Test
      Test.findById.mockResolvedValueOnce({ _id: 'test-id', negativeMarking: true });
      
      // Mock db response for Questions
      Question.find.mockResolvedValueOnce([
        { _id: 'q1', correctAnswer: 'A', marks: 3 },
        { _id: 'q2', correctAnswer: 'B', marks: 3 },
        { _id: 'q3', correctAnswer: 'C', marks: 3 },
      ]);
      
      const req = {
        json: jest.fn().mockResolvedValue({
          testId: 'test-id',
          studentDetails: { name: 'Jane Doe' },
          answers: {
            'q1': 'A', // correct (+3)
            'q2': 'D', // wrong (-1/3 of 3 = -1)
            'q3': null // unattempted (0)
          },
          warnings: 1,
          proctoringLogs: []
        })
      };

      const res = await submitTest(req);
      
      expect(res.status).toBe(200);
      expect(Submission).toHaveBeenCalledTimes(1);
      
      const submissionData = Submission.mock.calls[0][0];
      // 3 - 1 = 2
      expect(submissionData.score).toBe(2);
      expect(submissionData.correct).toBe(1);
      expect(submissionData.wrong).toBe(1);
      expect(submissionData.unattempted).toBe(1);
    });

    it('should apply fractional negative marking correctly', async () => {
      Test.findById.mockResolvedValueOnce({ _id: 'test-id', negativeMarking: true });
      Question.find.mockResolvedValueOnce([
        { _id: 'q1', correctAnswer: 'A', marks: 1 },
      ]);
      
      const req = {
        json: jest.fn().mockResolvedValue({
          testId: 'test-id',
          studentDetails: { name: 'Bob' },
          answers: { 'q1': 'B' }, // wrong (-0.33)
          warnings: 0,
          proctoringLogs: []
        })
      };

      const res = await submitTest(req);
      
      expect(res.status).toBe(200);
      const submissionData = Submission.mock.calls[0][0];
      expect(submissionData.score).toBe(-0.33); // (-1/3).toFixed(2)
      expect(submissionData.wrong).toBe(1);
    });
  });
});
