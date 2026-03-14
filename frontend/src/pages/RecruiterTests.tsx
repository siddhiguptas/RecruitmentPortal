import React, { useState, useEffect } from 'react';

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

const RecruiterTests: React.FC = () => {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [resultsMap, setResultsMap] = useState<Record<string, ResultItem[]>>({});

  const fetchTests = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/tests');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: TestItem[] = await resp.json();
      setTests(data);
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
      const resp = await fetch('/api/recruiters/tests/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, jobId, applicantIds: applicantIds.split(',').map(s => s.trim()) }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      alert('Test assigned successfully');
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const viewResults = async (testId: string) => {
    try {
      const resp = await fetch(`/api/tests/${testId}/results`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ResultItem[] = await resp.json();
      setResultsMap(prev => ({ ...prev, [testId]: data }));
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
      <h1 className="text-2xl font-bold mb-4">Available Tests</h1>

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
    </div>
  );
};

export default RecruiterTests;
