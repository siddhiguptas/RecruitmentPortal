import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader, RefreshCw } from "lucide-react";
import TestCard from "../components/TestCard";
import { getAllTests, startTest, Test } from "../services/testService";

const StudentTests: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"All" | "MCQ" | "Coding">("All");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllTests();
        setTests(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load tests. Please try again.");
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      setStartingTestId(testId);
      const result = await startTest(testId);
      navigate(`/student/test-attempt/${result.attemptId}`, {
        state: {
          test: result.test,
          attemptId: result.attemptId,
          startedAt: result.startedAt,
          duration: result.durationMinutes,
        },
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to start test";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setStartingTestId(null);
    }
  };

  const filteredTests = tests.filter((test) => {
    if (filterType === "All") return true;
    return test.type === filterType;
  });

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Assessments & Tests
                </h1>
                <p className="text-gray-600 mt-2">
                  Showcase your skills by attempting coding tests and MCQ assessments
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 flex-wrap">
              {["All", "MCQ", "Coding"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as "All" | "MCQ" | "Coding")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    filterType === type
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="animate-spin text-blue-500 mb-4" size={40} />
              <p className="text-gray-600 text-lg">Loading tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tests available
              </h3>
              <p className="text-gray-600">
                Check back later for new assessments and coding tests.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredTests.length} test
                {filteredTests.length !== 1 ? "s" : ""}
              </div>

              {/* Tests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <TestCard
                    key={test._id}
                    {...test}
                    onStartTest={handleStartTest}
                    isLoading={startingTestId === test._id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
  );
};

export default StudentTests;
