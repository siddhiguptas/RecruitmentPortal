import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

interface AdminTest {
  _id: string;
  title: string;
  questions?: any[];
  type: "MCQ" | "Coding" | "Mixed";
  jobRole?: string;
  questionsCount?: number;
  totalMarks?: number;
  duration?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  status?: "Active" | "Inactive";
  attemptsCount?: number;
  averageScore?: number;
  createdAt?: string;
}

interface TestResult {
  _id: string;
  student: any;
  score: number;
  timeTaken: number;
  passed: boolean;
  rank: number;
}

// simple confirmation modal (same pattern as other pages)
const ConfirmModal: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void; }> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-1/3 p-6 rounded-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-4 py-2 border rounded bg-gray-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const DetailsModal: React.FC<{ test: AdminTest; onClose: () => void }> = ({ test, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 p-6 rounded-lg overflow-auto max-h-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-semibold mb-4">Test Details</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Title:</span> {test.title}</p>
          <p><span className="font-semibold">Type:</span> {test.type}</p>
          <p><span className="font-semibold">Job Role:</span> {test.jobRole || "-"}</p>
          <p><span className="font-semibold">Questions:</span> {test.questions?.length || test.questionsCount || 0}</p>
          <p><span className="font-semibold">Total Marks:</span> {test.totalMarks || "-"}</p>
          <p><span className="font-semibold">Duration:</span> {test.duration} min</p>
          <p><span className="font-semibold">Difficulty:</span> {test.difficulty}</p>
          <p><span className="font-semibold">Status:</span> {test.status}</p>
          <p><span className="font-semibold">Attempts:</span> {test.attemptsCount || 0}</p>
          <p><span className="font-semibold">Average Score:</span> {test.averageScore || 0}</p>
          <p><span className="font-semibold">Created At:</span> {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "-"}</p>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold">Questions</h3>
          {test.questions && test.questions.length > 0 ? (
            <ul className="list-decimal list-inside">
              {test.questions.map((q, idx) => (
                <li key={idx} className="mb-2">
                  <p className="font-semibold">{q.text || (q as any).statement}</p>
                  {Array.isArray((q as any).options) && (
                    <ul className="list-disc list-inside ml-4">
                      {(q as any).options.map((opt: string, j: number) => (
                        <li key={j}>{opt}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions defined.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultsModal: React.FC<{ results: TestResult[]; onClose: () => void }> = ({ results, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 p-6 rounded-lg overflow-auto max-h-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        {results.length === 0 ? (
          <p>No participants yet.</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Score</th>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Rank</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="p-2">{(r.student as any)?.name || "-"}</td>
                  <td className="p-2">{(r.student as any)?.email || "-"}</td>
                  <td className="p-2">{r.score}</td>
                  <td className="p-2">{r.timeTaken} sec</td>
                  <td className="p-2">{r.passed ? "Pass" : "Fail"}</td>
                  <td className="p-2">{r.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// form for create/edit tests
const TestFormModal: React.FC<{
  existing?: AdminTest;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ existing, onSave, onClose }) => {
  const [title, setTitle] = useState(existing?.title || "");
  const [type, setType] = useState<"MCQ" | "Coding" | "Mixed">(
    existing?.type || "MCQ"
  );
  const [duration, setDuration] = useState(existing?.duration || 0);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    existing?.difficulty || "Easy"
  );
  const [jobRole, setJobRole] = useState(existing?.jobRole || "");
  const [questions, setQuestions] = useState<any[]>(
    existing?.questions ? [...existing.questions] : []
  );

  const addQuestion = () => {
    setQuestions((q) => [
      ...q,
      {
        id: Date.now() + Math.random(),
        qType: "MCQ",
        text: "",
        options: ["", "", "", ""],
        correct: 0,
        marks: 1,
        // coding fields
        statement: "",
        examples: "",
        testCases: "",
        timeLimit: 1,
        memoryLimit: 64,
        languages: "",
      },
    ]);
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    setQuestions((qs) => {
      const copy = [...qs];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const removeQuestion = (idx: number) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const submit = () => {
    const payload: any = {
      title,
      type,
      duration,
      difficulty,
      jobRole,
      questions,
    };
    if (existing) payload._id = existing._id;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 p-6 rounded-lg overflow-auto max-h-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-semibold mb-4">{existing ? "Edit" : "Create"} Test</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border p-2 rounded w-full"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="border p-2 rounded w-full"
          >
            <option value="MCQ">MCQ</option>
            <option value="Coding">Coding</option>
            <option value="Mixed">Mixed</option>
          </select>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            placeholder="Duration (minutes)"
            className="border p-2 rounded w-full"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="border p-2 rounded w-full"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="Job Role"
            className="border p-2 rounded w-full"
          />
          <div>
            <h3 className="font-semibold mb-2">Questions</h3>
            {questions.map((q, idx) => (
              <div key={q.id} className="border p-2 mb-2 rounded">
                <div className="flex justify-between items-center">
                  <select
                    value={q.qType}
                    onChange={(e) => updateQuestion(idx, "qType", e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Coding">Coding</option>
                  </select>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                {q.qType === "MCQ" && (
                  <div className="space-y-1 mt-1">
                    <input
                      type="text"
                      placeholder="Question text"
                      value={q.text}
                      onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                    {q.options.map((opt: string, j: number) => (
                      <input
                        key={j}
                        type="text"
                        placeholder={`Option ${j + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const arr = [...q.options];
                          arr[j] = e.target.value;
                          updateQuestion(idx, "options", arr);
                        }}
                        className="border p-1 rounded w-full"
                      />
                    ))}
                    <input
                      type="number"
                      placeholder="Correct option index (0-3)"
                      value={q.correct}
                      onChange={(e) => updateQuestion(idx, "correct", Number(e.target.value))}
                      className="border p-1 rounded w-full"
                    />
                    <input
                      type="number"
                      placeholder="Marks"
                      value={q.marks}
                      onChange={(e) => updateQuestion(idx, "marks", Number(e.target.value))}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                )}
                {q.qType === "Coding" && (
                  <div className="space-y-1 mt-1">
                    <textarea
                      placeholder="Problem statement"
                      value={q.statement}
                      onChange={(e) => updateQuestion(idx, "statement", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                    <input
                      type="text"
                      placeholder="Examples"
                      value={q.examples}
                      onChange={(e) => updateQuestion(idx, "examples", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                    <textarea
                      placeholder="Test cases"
                      value={q.testCases}
                      onChange={(e) => updateQuestion(idx, "testCases", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                    <input
                      type="number"
                      placeholder="Time limit (sec)"
                      value={q.timeLimit}
                      onChange={(e) => updateQuestion(idx, "timeLimit", Number(e.target.value))}
                      className="border p-1 rounded w-full"
                    />
                    <input
                      type="number"
                      placeholder="Memory limit (MB)"
                      value={q.memoryLimit}
                      onChange={(e) => updateQuestion(idx, "memoryLimit", Number(e.target.value))}
                      className="border p-1 rounded w-full"
                    />
                    <input
                      type="text"
                      placeholder="Languages (comma separated)"
                      value={q.languages}
                      onChange={(e) => updateQuestion(idx, "languages", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addQuestion}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Add Question
            </button>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded bg-gray-100">Cancel</button>
            <button onClick={submit} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminTests: React.FC = () => {
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [filtered, setFiltered] = useState<AdminTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");

  const [detailTest, setDetailTest] = useState<AdminTest | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editTest, setEditTest] = useState<AdminTest | null>(null);

  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // statistics
  const totalTests = filtered.length;
  const activeTests = filtered.filter((t) => t.status === "Active").length;
  const totalAttempts = filtered.reduce((acc, t) => acc + (t.attemptsCount || 0), 0);
  const averageScore = filtered.length
    ? filtered.reduce((acc, t) => acc + (t.averageScore || 0), 0) / filtered.length
    : 0;

  useEffect(() => {
    setLoading(true);
    adminService
      .getAllTests()
      .then((data) => {
        setTests(data as any);
        setFiltered(data as any);
      })
      .catch((e) => setError(e.message || "Failed to load tests"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...tests];
    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (difficultyFilter.trim()) {
      list = list.filter((t) => t.difficulty === difficultyFilter);
    }
    if (typeFilter.trim()) {
      list = list.filter((t) => t.type === typeFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(term));
    }
    if (sortOption === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );
    } else if (sortOption === "attempts") {
      list.sort(
        (a, b) => (b.attemptsCount || 0) - (a.attemptsCount || 0)
      );
    }
    setFiltered(list);
  }, [
    tests,
    statusFilter,
    difficultyFilter,
    typeFilter,
    searchTerm,
    sortOption,
  ]);

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "details") {
        const t = tests.find((x) => x._id === id);
        if (t) setDetailTest(t);
        return;
      }
      if (action === "results") {
        setModalLoading(true);
        setModalError(null);
        try {
          const res = await adminService.getTestResults(id);
          setResults(res as any || []);
        } catch (e: any) {
          setModalError(e.message || "Failed to load results");
        } finally {
          setModalLoading(false);
        }
        return;
      }
      if (action === "activate") {
        await adminService.updateTest(id, { status: "Active" });
      } else if (action === "deactivate") {
        await adminService.updateTest(id, { status: "Inactive" });
      } else if (action === "delete") {
        setConfirmMessage("This will permanently delete the test. Continue?");
        setPendingId(id);
        return;
      } else if (action === "edit") {
        const t = tests.find((x) => x._id === id);
        if (t) {
          setEditTest(t);
          setShowForm(true);
        }
        return;
      }
      // refresh list after simple actions
      const updated = await adminService.getAllTests();
      setTests(updated as any);
    } catch (e: any) {
      alert(e.message || "Action failed");
    }
  };

  const performPending = async () => {
    if (!pendingId || !confirmMessage) return;
    try {
      if (confirmMessage.toLowerCase().includes("delete")) {
        await adminService.deleteTest(pendingId);
      }
      const updated = await adminService.getAllTests();
      setTests(updated as any);
    } catch (e: any) {
      alert(e.message || "Action failed");
    } finally {
      setPendingId(null);
      setConfirmMessage(null);
    }
  };

  const cancelPending = () => {
    setPendingId(null);
    setConfirmMessage(null);
  };

  const handleFormSave = async (data: any) => {
    try {
      if (editTest) {
        await adminService.updateTest(editTest._id, data);
      } else {
        await adminService.createTest(data);
      }
      const updated = await adminService.getAllTests();
      setTests(updated as any);
      setShowForm(false);
      setEditTest(null);
    } catch (e: any) {
      alert(e.message || "Save failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Tests</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Test
        </button>
      </div>

      {loading && <p>Loading tests...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Tests</p>
          <p className="text-xl font-semibold">{totalTests}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Active Tests</p>
          <p className="text-xl font-semibold">{activeTests}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Attempts</p>
          <p className="text-xl font-semibold">{totalAttempts}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Average Score</p>
          <p className="text-xl font-semibold">{averageScore.toFixed(1)}</p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1 mb-2 md:mb-0"
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="Coding">Coding</option>
          <option value="Mixed">Mixed</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="newest">Newest</option>
          <option value="attempts">Highest attempts</option>
        </select>
      </div>

      {/* tests table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Job Role</th>
              <th className="text-left p-2">Questions</th>
              <th className="text-left p-2">Duration</th>
              <th className="text-left p-2">Difficulty</th>
              <th className="text-left p-2">Attempts</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t._id} className="border-b">
                <td className="p-2">{t.title}</td>
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.jobRole || "-"}</td>
                <td className="p-2">{t.questions?.length || t.questionsCount || 0}</td>
                <td className="p-2">{t.duration}m</td>
                <td className="p-2">{t.difficulty}</td>
                <td className="p-2">{t.attemptsCount || 0}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2 space-x-1">
                  <button onClick={() => handleAction("details", t._id)} className="text-blue-600 text-sm">Details</button>
                  <button onClick={() => handleAction("results", t._id)} className="text-purple-600 text-sm">Results</button>
                  <button onClick={() => handleAction("edit", t._id)} className="text-green-600 text-sm">Edit</button>
                  {t.status === "Active" ? (
                    <button onClick={() => handleAction("deactivate", t._id)} className="text-yellow-600 text-sm">Deactivate</button>
                  ) : (
                    <button onClick={() => handleAction("activate", t._id)} className="text-green-600 text-sm">Activate</button>
                  )}
                  <button onClick={() => handleAction("delete", t._id)} className="text-red-600 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailTest && <DetailsModal test={detailTest} onClose={() => setDetailTest(null)} />}
      {modalLoading && <p>Loading results...</p>}
      {modalError && <p className="text-red-600">{modalError}</p>}
      {results !== null && <ResultsModal results={results} onClose={() => setResults(null)} />}
      {showForm && <TestFormModal existing={editTest || undefined} onSave={handleFormSave} onClose={() => { setShowForm(false); setEditTest(null); }} />}
      {confirmMessage && <ConfirmModal message={confirmMessage} onConfirm={performPending} onCancel={cancelPending} />}
    </div>
  );
};

export default AdminTests;
