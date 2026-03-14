import React from "react";
import clsx from "clsx";
import { CheckCircle } from "lucide-react";

interface MCQQuestionProps {
  type: "mcq";
  questionIndex: number;
  questionText: string;
  options: string[];
  selectedAnswer?: number;
  onSelectAnswer: (answerIndex: number) => void;
  marks?: number;
}

interface CodingQuestionProps {
  type: "coding";
  questionIndex: number;
  title: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  code: string;
  onCodeChange: (code: string) => void;
  marks?: number;
}

type QuestionCardProps = MCQQuestionProps | CodingQuestionProps;

const QuestionCard: React.FC<QuestionCardProps> = (props) => {
  if (props.type === "mcq") {
    const {
      questionIndex,
      questionText,
      options,
      selectedAnswer,
      onSelectAnswer,
      marks = 1,
    } = props;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        {/* Question Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Question {questionIndex + 1}
            </h3>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
              {marks} marks
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">{questionText}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onSelectAnswer(idx)}
              className={clsx(
                "w-full text-left p-4 border-2 rounded-lg transition-all",
                selectedAnswer === idx
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    selectedAnswer === idx
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  )}
                >
                  {selectedAnswer === idx && (
                    <CheckCircle size={20} className="text-white" fill="currentColor" />
                  )}
                </div>
                <span className="text-gray-700 leading-relaxed flex-1">
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Coding Question
  const {
    questionIndex,
    title,
    description,
    inputFormat,
    outputFormat,
    constraints,
    examples,
    code,
    onCodeChange,
    marks = 10,
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Problem Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm max-h-96 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Problem {questionIndex + 1}: {title}
            </h3>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded whitespace-nowrap ml-2">
              {marks} marks
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {/* Input Format */}
        {inputFormat && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Input Format</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {inputFormat}
            </p>
          </div>
        )}

        {/* Output Format */}
        {outputFormat && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Output Format</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {outputFormat}
            </p>
          </div>
        )}

        {/* Constraints */}
        {constraints && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Constraints</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {constraints}
            </p>
          </div>
        )}

        {/* Examples */}
        {examples && examples.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Examples</h4>
            <div className="space-y-3">
              {examples.map((example, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Input {idx + 1}
                    </p>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {example.input}
                    </pre>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Output {idx + 1}
                    </p>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {example.output}
                    </pre>
                  </div>
                  {example.explanation && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Explanation
                      </p>
                      <p className="text-sm text-gray-700">{example.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex flex-col">
        <div className="mb-3">
          <label className="text-sm font-semibold text-gray-800">
            Write your code here
          </label>
          <p className="text-xs text-gray-600">Language: JavaScript</p>
        </div>

        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="// Write your solution here"
          className="flex-1 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
        />

        <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
          <p className="font-semibold mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Test your code with the provided examples</li>
            <li>Submit your solution when ready</li>
            <li>Any code with meaningful logic will receive partial credit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
