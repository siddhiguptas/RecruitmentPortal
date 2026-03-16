import api from "./api";

export interface Test {
  _id: string;
  title: string;
  company: string;
  type: "MCQ" | "Coding";
  description?: string;
  duration: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  deadline?: Date;
  passingScore: number;
  questions?: Question[];
  codingProblems?: CodingProblem[];
}

export interface Question {
  questionText: string;
  options: string[];
  marks?: number;
}

export interface CodingProblem {
  title: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  marks?: number;
}

export interface TestAttempt {
  _id: string;
  test: string | Test;
  student: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: Date;
  submittedAt?: Date;
  totalScore?: number;
  percentage?: number;
  passed?: boolean;
  timeTaken?: number;
}

export interface TestResult {
  _id: string;
  test: Test;
  totalScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: Date;
  timeTaken: number;
}

/**
 * Get all available tests for the student
 */
export const getAllTests = async (): Promise<Test[]> => {
  try {
    // baseURL already includes '/api'
    const response = await api.get("/tests");
    return response.data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
};

/**
 * Get test details by ID
 */
export const getTestDetails = async (testId: string): Promise<any> => {
  try {
    const response = await api.get(`/tests/${testId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test details:", error);
    throw error;
  }
};

/**
 * Start taking a test
 */
export const startTest = async (testId: string): Promise<any> => {
  try {
    const response = await api.post(`/tests/${testId}/start`);
    return response.data;
  } catch (error) {
    console.error("Error starting test:", error);
    throw error;
  }
};

/**
 * Save answer while taking test (auto-save)
 */
export const saveAnswer = async (
  attemptId: string,
  type: "mcq" | "coding",
  questionIndex: number,
  answer: any,
  timeSpent: number
): Promise<void> => {
  try {
    await api.post(`/tests/${attemptId}/save-answer`, {
      type,
      questionIndex,
      answer,
      timeSpent,
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    throw error;
  }
};

/**
 * Submit test
 */
export const submitTest = async (attemptId: string): Promise<any> => {
  try {
    const response = await api.post(`/tests/${attemptId}/submit`);
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    throw error;
  }
};

/**
 * Auto-submit test when timer expires
 */
export const autoSubmitTest = async (attemptId: string): Promise<any> => {
  try {
    const response = await api.post(`/tests/${attemptId}/auto-submit`);
    return response.data;
  } catch (error) {
    console.error("Error auto-submitting test:", error);
    throw error;
  }
};

/**
 * Get all test results for student
 */
export const getTestResults = async (): Promise<TestResult[]> => {
  try {
    const response = await api.get("/tests/results/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching test results:", error);
    throw error;
  }
};

/**
 * Get detailed result for a specific attempt
 */
export const getAttemptResult = async (attemptId: string): Promise<any> => {
  try {
    const response = await api.get(`/tests/attempt/${attemptId}/result`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attempt result:", error);
    throw error;
  }
};

/**
 * Get ongoing test attempts
 */
export const getOngoingAttempts = async (): Promise<TestAttempt[]> => {
  try {
    const response = await api.get("/tests/ongoing/list");
    return response.data;
  } catch (error) {
    console.error("Error fetching ongoing attempts:", error);
    throw error;
  }
};
