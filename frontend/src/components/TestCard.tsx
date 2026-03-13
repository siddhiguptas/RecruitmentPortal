import React from "react";
import { Clock, BookOpen, Calendar, Play } from "lucide-react";
import clsx from "clsx";

interface TestCardProps {
  _id: string;
  title: string;
  company: string;
  type: "MCQ" | "Coding";
  duration: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  deadline?: Date;
  passingScore: number;
  onStartTest: (testId: string) => void;
  isLoading?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({
  _id,
  title,
  company,
  type,
  duration,
  totalQuestions,
  difficulty,
  deadline,
  passingScore,
  onStartTest,
  isLoading = false,
}) => {

  const difficultyColor = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  const typeColor = {
    MCQ: "bg-blue-100 text-blue-800",
    Coding: "bg-purple-100 text-purple-800",
  };

  const isDeadlineApproaching = deadline
    ? new Date(deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000)
    : false;

  const handleStartClick = () => {
    onStartTest(_id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 font-medium">{company}</p>
        </div>
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2",
            typeColor[type]
          )}
        >
          {type}
        </span>
      </div>

      {/* Difficulty and Passing Score */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            difficultyColor[difficulty]
          )}
        >
          {difficulty}
        </span>
        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Pass: {passingScore}%
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock size={16} className="text-blue-500" />
          <span>{duration} mins</span>
        </div>

        {/* Total Questions */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <BookOpen size={16} className="text-purple-500" />
          <span>{totalQuestions} Q's</span>
        </div>

        {/* Deadline */}
        {deadline && (
          <div
            className={clsx(
              "flex items-center gap-2 text-sm col-span-2",
              isDeadlineApproaching ? "text-red-600 font-semibold" : "text-gray-700"
            )}
          >
            <Calendar size={16} />
            <span>
              {isDeadlineApproaching && "Due: "}
              {new Date(deadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartClick}
        disabled={isLoading}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all",
          isLoading
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg active:scale-95"
        )}
      >
        <Play size={18} />
        {isLoading ? "Starting..." : "Start Test"}
      </button>
    </div>
  );
};

export default TestCard;
