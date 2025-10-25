"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface PullRequest {
  id: number;
  title: string;
  url: string;
  state: string;
  author: string;
  createdAt: string;
}

export default function PullsPage() {
  const [pulls, setPulls] = useState<PullRequest[]>([]);
  const [filtered, setFiltered] = useState<PullRequest[]>([]);
  const [search, setSearch] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPulls = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pr/list");
      if (!res.ok) throw new Error("Failed to fetch PRs");
      const data: PullRequest[] = await res.json();
      setPulls(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setError("Error loading pull requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulls();
  }, []);

  // Filter
  useEffect(() => {
    let filteredList = pulls;

    if (stateFilter !== "all") {
      filteredList = filteredList.filter(
        (pr) => pr.state.toLowerCase() === stateFilter.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      filteredList = filteredList.filter((pr) =>
        pr.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(filteredList);
  }, [search, stateFilter, pulls]);

  // Sync
  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const repoUrl = prompt("Enter GitHub repo URL to sync:");
      if (!repoUrl) return;

      const res = await fetch("/api/pr/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to sync");
      alert(`✅ Synced ${data.totalPRs} PRs successfully!`);
      await fetchPulls();
    } catch (err) {
      console.error(err);
      setError("Failed to sync from GitHub");
    } finally {
      setSyncing(false);
    }
  };

  // Chart Data
  const stateData = [
    { name: "Open", value: pulls.filter((p) => p.state === "open").length },
    { name: "Closed", value: pulls.filter((p) => p.state === "closed").length },
    { name: "Merged", value: pulls.filter((p) => p.state === "merged").length },
  ];

  const authorData = Object.entries(
    pulls.reduce((acc, pr) => {
      acc[pr.author] = (acc[pr.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([author, count]) => ({ author, count }));

  const dateData = Object.entries(
    pulls.reduce((acc, pr) => {
      const date = new Date(pr.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([date, count]) => ({ date, count }));

  const COLORS = ["#4f46e5", "#16a34a", "#9333ea"];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading pull requests...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
          <h1 className="text-3xl font-bold text-gray-900">PRLens Dashboard</h1>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-5 py-2 rounded-lg text-white font-medium shadow ${
              syncing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {syncing ? "Syncing..." : "🔄 Sync Latest"}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <input
            type="text"
            placeholder="Search pull requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex flex-wrap gap-2">
            {["all", "open", "closed", "merged"].map((state) => (
              <button
                key={state}
                onClick={() => setStateFilter(state)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  stateFilter === state
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              PRs by State
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stateData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {stateData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Top Contributors
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={authorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="author" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              PR Activity Over Time
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#9333ea"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR List */}
        {error && (
          <p className="text-red-600 mb-4 text-sm text-center">{error}</p>
        )}

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center">No pull requests found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((pr) => (
              <div
                key={pr.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-indigo-600 hover:underline"
                >
                  {pr.title}
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  Author:{" "}
                  <span className="font-medium text-gray-800">{pr.author}</span>
                </p>
                <p
                  className={`text-sm mt-1 font-medium ${
                    pr.state === "open"
                      ? "text-green-600"
                      : pr.state === "closed"
                      ? "text-red-600"
                      : pr.state === "merged"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  {pr.state.toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(pr.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
