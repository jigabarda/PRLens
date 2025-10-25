"use client";
import { useState } from "react";
import axios from "axios";

// 🧩 Define TypeScript types for GitHub PRs
interface GitHubUser {
  login: string;
}

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  user: GitHubUser;
  state: string;
}

interface PRResponse {
  message: string;
  totalPRs: number;
  sampleData: GitHubPR[];
}

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PRResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post<PRResponse>("/api/pr/fetch", { repoUrl });
      setResult(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Something went wrong");
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          PRLens – GitHub Pull Request Analyzer
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter GitHub repo URL (e.g., https://github.com/vercel/next.js)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "Fetching..." : "Analyze"}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-700 mb-2">
              Found {result.totalPRs} open PRs
            </h2>
            <ul className="space-y-2">
              {result.sampleData.map((pr) => (
                <li
                  key={pr.id}
                  className="border p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    #{pr.number} – {pr.title}
                  </a>
                  <p className="text-sm text-gray-500">
                    by {pr.user.login} | {pr.state}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
