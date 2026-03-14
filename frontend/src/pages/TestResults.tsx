import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Loader,
} from "lucide-react";
import clsx from "clsx";

import DashboardLayout from "../components/DashboardLayout";
import { getAttemptResult } from "../services/testService";

/* ---------------- Interfaces ---------------- */

interface QuestionResult {
  questionIndex: number;
  questionText?: string;
  options?: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  isCorrect?: boolean;
  explanation?: string;
  marks?: number;
  timeSpent?: number;

  title?: string;
  description?: string;
  code?: string;
  language?: string;
  score?: number;
}

interface Test {
  title: string;
  company?: string;
  type: "MCQ" | "Coding";
  passingScore?: number;
  totalQuestions?: number;
}

interface AttemptResult {
  test: Test;
  attemptId: string;
  totalScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  submittedAt: string;
  answers: QuestionResult[];
}

/* ---------------- Component ---------------- */

const TestResults: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();

  const state = location.state as { autoSubmitted?: boolean };

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null);

  /* ---------------- Fetch Result ---------------- */

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) return;

      try {
        setLoading(true);
        const data = await getAttemptResult(attemptId);
        setResult(data);
        setError(null);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Failed to load results";
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-600 text-lg">Loading your results...</p>
      </div>
    );
  }

  /* ---------------- Error ---------------- */

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="text-red-500 mb-4" size={32} />
          <h3 className="font-bold text-red-900 mb-2">
            Error Loading Results
          </h3>
          <p className="text-red-800 mb-4">{error}</p>

          <button
            onClick={() => navigate("/student/tests")}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const { test, totalScore, percentage, passed, timeTaken, submittedAt, answers } =
    result;

  /* ---------------- Helpers ---------------- */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (pct: number) => {
    if (pct >= 80) return "bg-green-100 border-green-300";
    if (pct >= 60) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">

        {/* Header */}

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">

            <button
              onClick={() => navigate("/student/tests")}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6 font-semibold"
            >
              <ArrowLeft size={20} />
              Back to Tests
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              {test.title}
            </h1>

            <p className="text-gray-600">{test.company ?? "Company Test"}</p>

          </div>
        </div>

        {/* Content */}

        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* Auto submit */}

          {state?.autoSubmitted && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <AlertCircle className="text-yellow-600 mb-2" size={20} />
              <p className="text-yellow-800 text-sm">
                Your test was automatically submitted because time expired.
              </p>
            </div>
          )}

          {/* Score */}

          <div
            className={clsx(
              "rounded-lg border-2 p-8 mb-8",
              getScoreBgColor(percentage)
            )}
          >
            <div className="flex justify-between items-center">

              <div>

                <p
                  className={clsx(
                    "text-6xl font-bold",
                    getScoreColor(percentage)
                  )}
                >
                  {percentage}%
                </p>

                <p className="text-lg font-semibold text-gray-800">
                  {passed ? "✓ Test Passed" : "✗ Test Failed"}
                </p>

                {test.passingScore && (
                  <p className="text-sm text-gray-600">
                    Passing Score: {test.passingScore}%
                  </p>
                )}

              </div>

              <div className="text-right">
                <p className="text-4xl font-bold">{totalScore}</p>
                <p className="text-gray-700">points</p>
              </div>

            </div>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

            <div className="bg-white p-6 rounded border">
              <Clock className="text-blue-500 mb-2" />
              <p className="text-gray-600">Time Taken</p>
              <p className="text-xl font-bold">{timeTaken} min</p>
            </div>

            <div className="bg-white p-6 rounded border">
              <Award className="text-yellow-500 mb-2" />
              <p className="text-gray-600">Total Questions</p>
              <p className="text-xl font-bold">
                {answers?.length || test.totalQuestions}
              </p>
            </div>

            <div className="bg-white p-6 rounded border">
              <CheckCircle className="text-green-500 mb-2" />
              <p className="text-gray-600">Submitted</p>
              <p className="text-sm">{formatDate(submittedAt)}</p>
            </div>

          </div>

          {/* Answer Review */}

          {test.type === "MCQ" && answers && (
            <div className="bg-white border rounded-lg">

              <div className="border-b p-4 font-semibold">
                Answer Review
              </div>

              {answers.map((answer, idx) => (

                <div key={idx} className="p-6 border-b">

                  <button
                    onClick={() =>
                      setExpandedAnswer(
                        expandedAnswer === idx ? null : idx
                      )
                    }
                    className="w-full text-left"
                  >

                    <h4 className="font-semibold mb-2">
                      Question {idx + 1}
                    </h4>

                    <p>{answer.questionText}</p>

                  </button>

                  {expandedAnswer === idx && (

                    <div className="mt-4 space-y-2">

                      <div>
                        <strong>Your Answer:</strong>{" "}
                        {answer.options?.[
                          answer.selectedAnswer ?? -1
                        ] || "Not answered"}
                      </div>

                      {!answer.isCorrect && (
                        <div className="text-green-600">
                          <strong>Correct:</strong>{" "}
                          {answer.options?.[
                            answer.correctAnswer ?? -1
                          ]}
                        </div>
                      )}

                      {answer.explanation && (
                        <div className="text-blue-700 text-sm">
                          {answer.explanation}
                        </div>
                      )}

                    </div>

                  )}

                </div>

              ))}

            </div>
          )}

          {/* Actions */}

          <div className="flex justify-center gap-4 mt-10">

            <button
              onClick={() => navigate("/student/tests")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg"
            >
              Take Another Test
            </button>

            <button
              onClick={() => navigate("/student/dashboard")}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg"
            >
              Dashboard
            </button>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestResults;