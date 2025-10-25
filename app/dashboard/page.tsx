"use client";

import { useEffect, useState } from "react";

interface RepoHistory {
  id: number;
  repoUrl: string;
  owner: string;
  repo: string;
  totalPRs: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [history, setHistory] = useState<RepoHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data.history || []);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const reanalyze = async (repoUrl: string) => {
    await fetch("/api/pr/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl }),
    });
    alert("Re-analysis complete!");
  };

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-20">
        Loading repository history...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Repository History
      </h1>

      {history.length === 0 ? (
        <p className="text-center text-gray-500">
          No repositories analyzed yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((repo) => (
            <div
              key={repo.id}
              className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg text-gray-800 mb-1">
                {repo.repo}
              </h2>
              <p className="text-sm text-gray-500 mb-2">@{repo.owner}</p>
              <p className="text-sm text-gray-600 mb-4">
                Total PRs:{" "}
                <span className="font-medium text-blue-600">
                  {repo.totalPRs}
                </span>
              </p>
              <button
                onClick={() => reanalyze(repo.repoUrl)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                Analyze Again
              </button>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(repo.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
