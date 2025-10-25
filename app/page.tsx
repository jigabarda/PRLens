"use client";
import Link from "next/link";

import { useState } from "react";

interface User {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface PullRequest {
  html_url: string;
  title: string;
  state: string;
  user?: User;
}

interface FetchResponse {
  message: string;
  totalPRs: number;
  sampleData: PullRequest[];
}

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FetchResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/pr/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: FetchResponse = await response.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          GitHub PR Fetcher
        </h1>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter GitHub repo URL (e.g. https://github.com/vercel/next.js)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">⚠️ {error}</p>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              ✅ <strong>{result.message}</strong> <br />
              Total PRs: <strong>{result.totalPRs}</strong>
            </p>

            <ul className="space-y-2 max-h-80 overflow-y-auto border-t pt-2">
              {result.sampleData.slice(0, 5).map((pr, index) => (
                <li
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {pr.title}
                  </a>
                  <p className="text-sm text-gray-500">
                    by {pr.user?.login || "Unknown"} | State: {pr.state}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/pulls"
          className="text-indigo-600 hover:underline block text-center mt-4"
        >
          View Saved PRs →
        </Link>
      </div>
    </main>
  );
}
