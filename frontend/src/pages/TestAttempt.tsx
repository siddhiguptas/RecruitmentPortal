import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Send, AlertCircle, Clock } from "lucide-react";
import clsx from "clsx";
import QuestionCard from "../components/QuestionCard";
import { saveAnswer, submitTest } from "../services/testService";

interface MCQAnswer {
  questionIndex: number;
  selectedAnswer?: number;
}

interface CodingAnswer {
  problemIndex: number;
  code: string;
}

const TestAttempt: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();

  const state = location.state as {
    test: any;
    attemptId: string;
    startedAt: string;
    duration: number;
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(state?.duration * 60 || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<MCQAnswer[]>(
    state?.test?.questions?.map((_: any, idx: number) => ({
      questionIndex: idx,
      selectedAnswer: undefined,
    })) || []
  );
  const [codingAnswers, setCodingAnswers] = useState<CodingAnswer[]>(
    state?.test?.codingProblems?.map((_: any, idx: number) => ({
      problemIndex: idx,
      code: "",
    })) || []
  );

  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const test = state?.test;
  const questions = test?.questions || [];
  const codingProblems = test?.codingProblems || [];
  const totalItems = test?.type === "MCQ" ? questions.length : codingProblems.length;

  // Auto-save answer
  const handleAutoSave = useCallback(
    (questionIdx: number, answer: any) => {
      if (!attemptId) return;

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveAnswer(attemptId, test?.type === "MCQ" ? "mcq" : "coding", questionIdx, answer, 0);
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }, 1000);
    },
    [attemptId, test?.type]
  );

  // Handle MCQ answer selection
  const handleSelectMCQAnswer = (answerIndex: number) => {
    const newAnswers = [...mcqAnswers];
    newAnswers[currentPage].selectedAnswer = answerIndex;
    setMcqAnswers(newAnswers);
    handleAutoSave(currentPage, answerIndex);
  };

  // Handle coding answer change
  const handleCodingChange = (code: string) => {
    const newAnswers = [...codingAnswers];
    newAnswers[currentPage].code = code;
    setCodingAnswers(newAnswers);
    handleAutoSave(currentPage, code);
  };

  // Timer effect
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Auto-submit when time expires
  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId || submitted) return;

    try {
      setIsSubmitting(true);
      await submitTest(attemptId);
      setSubmitted(true);
      navigate(`/student/test-results/${attemptId}`, {
        state: { autoSubmitted: true, test },
      });
    } catch (err) {
      console.error("Auto-submit failed:", err);
      alert("Failed to auto-submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, navigate, submitted, test]);

  // Prevent accidental page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submitted]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const isTimeLow = timeRemaining < 300; // Less than 5 minutes
  const isTimeVeryLow = timeRemaining < 60; // Less than 1 minute

  // Handle manual submission
  const handleSubmitTest = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to submit? You have ${formatTime(timeRemaining)} remaining.`
    );

    if (!confirmed) return;

    if (!attemptId) return;

    try {
      setIsSubmitting(true);
      await submitTest(attemptId);
      setSubmitted(true);
      navigate(`/student/test-results/${attemptId}`, {
        state: { test },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit test");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render question based on type
  const renderCurrentQuestion = () => {
    if (test?.type === "MCQ" && questions[currentPage]) {
      const question = questions[currentPage];
      const answer = mcqAnswers[currentPage];
      return (
        <QuestionCard
          type="mcq"
          questionIndex={currentPage}
          questionText={question.questionText}
          options={question.options}
          selectedAnswer={answer.selectedAnswer}
          onSelectAnswer={handleSelectMCQAnswer}
          marks={question.marks}
        />
      );
    }

    if (test?.type === "Coding" && codingProblems[currentPage]) {
      const problem = codingProblems[currentPage];
      const answer = codingAnswers[currentPage];
      return (
        <QuestionCard
          type="coding"
          questionIndex={currentPage}
          title={problem.title}
          description={problem.description}
          inputFormat={problem.inputFormat}
          outputFormat={problem.outputFormat}
          constraints={problem.constraints}
          examples={problem.examples}
          code={answer.code}
          onCodeChange={handleCodingChange}
          marks={problem.marks}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Timer */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test?.title}</h1>
              <p className="text-sm text-gray-600">{test?.company}</p>
            </div>

            {/* Timer */}
            <div
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg",
                isTimeVeryLow
                  ? "bg-red-100 text-red-700 animate-pulse"
                  : isTimeLow
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              <Clock size={20} />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting || submitted}
              className={clsx(
                "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all",
                isSubmitting || submitted
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg active:scale-95"
              )}
            >
              <Send size={18} />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Time Alert */}
          {isTimeVeryLow && (
            <div className="lg:col-span-4 mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-900">Time Running Out!</h3>
                <p className="text-red-800 text-sm mt-1">
                  You have less than 1 minute remaining. Please submit your test.
                </p>
              </div>
            </div>
          )}

          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {renderCurrentQuestion()}
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">
                {test?.type === "MCQ" ? "Questions" : "Problems"}
              </h3>

              {/* Question Grid */}
              <div className="grid grid-cols-6 lg:grid-cols-4 gap-2 mb-6">
                {Array.from({ length: totalItems }).map((_, idx) => {
                  const isAnswered = test?.type === "MCQ"
                    ? mcqAnswers[idx]?.selectedAnswer !== undefined
                    : codingAnswers[idx]?.code?.trim().length > 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={clsx(
                        "w-10 h-10 rounded-lg font-semibold transition-all flex items-center justify-center",
                        currentPage === idx
                          ? "bg-blue-500 text-white shadow-md scale-110"
                          : isAnswered
                          ? "bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                      )}
                      title={`${test?.type === "MCQ" ? "Question" : "Problem"} ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="text-xs space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-700">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-300 rounded border-2 border-green-300"></div>
                  <span className="text-gray-700">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded border-2 border-gray-300"></div>
                  <span className="text-gray-700">Not Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 bg-white p-6 rounded-lg shadow-sm">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
            disabled={currentPage === 0}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all",
              currentPage === 0
                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <span className="text-gray-600 font-medium">
            {test?.type === "MCQ" ? "Question" : "Problem"} {currentPage + 1} of{" "}
            {totalItems}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalItems - 1))}
            disabled={currentPage === totalItems - 1}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all",
              currentPage === totalItems - 1
                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAttempt;
