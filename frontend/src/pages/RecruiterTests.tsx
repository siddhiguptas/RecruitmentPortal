import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { createTest } from '../services/testService';

interface TestItem {
  _id: string;
  title: string;
  jobRole?: string;
  duration: number; // minutes
  difficulty?: string;
}

interface ResultItem {
  studentName: string;
  score: number;
  attemptedAt: string;
}

// form for create/edit tests
const TestFormModal: React.FC<{
  existing?: TestItem;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ existing, onSave, onClose }) => {
  const [title, setTitle] = useState(existing?.title || "");
  const [type, setType] = useState<"MCQ" | "Coding" | "Mixed">(
    (existing as any)?.type || "MCQ"
  );
  const [duration, setDuration] = useState(existing?.duration || 0);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    (existing as any)?.difficulty || "Easy"
  );
  const [jobRole, setJobRole] = useState(existing?.jobRole || "");
  const [questions, setQuestions] = useState<any[]>(
    (existing as any)?.questions ? [...(existing as any).questions] : []
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

const RecruiterTests: React.FC = () => {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [resultsMap, setResultsMap] = useState<Record<string, ResultItem[]>>({});
  const [showForm, setShowForm] = useState(false);

  const handleFormSave = async (data: any) => {
    try {
      await createTest(data);
      fetchTests();
      setShowForm(false);
    } catch (e: any) {
      alert(e.message || "Save failed");
    }
  };

  const fetchTests = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.get('/tests/recruiter');
      setTests(resp.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const assignTest = async (testId: string) => {
    const jobId = prompt('Enter job ID to assign the test to:');
    const applicantIds = prompt('Enter comma-separated applicant IDs:');
    if (!jobId || !applicantIds) return;
    try {
      await api.post('/recruiters/tests/assign', { 
        testId, 
        jobId, 
        applicantIds: applicantIds.split(',').map(s => s.trim()) 
      });
      alert('Test assigned successfully');
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const viewResults = async (testId: string) => {
    try {
      const resp = await api.get(`/tests/${testId}/results`);
      setResultsMap(prev => ({ ...prev, [testId]: resp.data }));
    } catch (err: any) {
      alert(err.message || 'Unable to fetch results');
    }
  };

  const computeStats = (testId: string) => {
    const results = resultsMap[testId] || [];
    if (results.length === 0) return { attempts: 0, avg: 0 };
    const attempts = results.length;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / attempts;
    return { attempts, avg };
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Available Tests</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Test
        </button>
      </div>

      {loading && <div>Loading tests...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Job Role</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Difficulty</th>
              <th className="p-2">Attempts</th>
              <th className="p-2">Avg Score</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => {
              const stats = computeStats(t._id);
              return (
                <tr key={t._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">{t.jobRole || '-'}</td>
                  <td className="p-2">{t.duration} min</td>
                  <td className="p-2">{t.difficulty || '-'}</td>
                  <td className="p-2">{stats.attempts}</td>
                  <td className="p-2">{stats.avg.toFixed(1)}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => assignTest(t._id)}
                      className="text-blue-600 hover:underline"
                    >Assign Test</button>
                    <button
                      onClick={() => viewResults(t._id)}
                      className="text-green-600 hover:underline"
                    >View Results</button>
                  </td>
                </tr>
              );
            })}
            {tests.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No tests available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* optionally render results details below */}
      {Object.entries(resultsMap).map(([testId, results]) => (
        <div key={testId} className="mt-6 bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Results for test</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Student</th>
                <th className="p-2">Score</th>
                <th className="p-2">Attempted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">{r.studentName}</td>
                  <td className="p-2">{r.score}</td>
                  <td className="p-2">{new Date(r.attemptedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {showForm && (
        <TestFormModal
          onSave={handleFormSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default RecruiterTests;
