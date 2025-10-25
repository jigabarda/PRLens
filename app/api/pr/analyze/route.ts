import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all pull requests
    const pulls = await prisma.pullRequest.findMany();

    const totalPRs = pulls.length;

    // Count by state
    const openPRs = pulls.filter((p) => p.state === "open").length;
    const closedPRs = pulls.filter((p) => p.state === "closed").length;
    const mergedPRs = pulls.filter((p) => p.state === "merged").length;

    // Top 5 authors
    const authorCount: Record<string, number> = {};
    for (const pr of pulls) {
      if (pr.author) {
        authorCount[pr.author] = (authorCount[pr.author] || 0) + 1;
      }
    }

    const topAuthors = Object.entries(authorCount)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ✅ Create RepoHistory entry (adjusted to your schema)
    if (pulls.length > 0) {
      const firstPR = pulls[0];
      await prisma.repoHistory.create({
        data: {
          repoUrl: `https://github.com/${firstPR.author ?? "unknown"}/${
            firstPR.title ?? "repo"
          }`,
          owner: firstPR.author ?? "unknown",
          repo: firstPR.title ?? "repo",
          totalPRs,
        },
      });
    }

    return NextResponse.json({
      totalPRs,
      openPRs,
      closedPRs,
      mergedPRs,
      topAuthors,
    });
  } catch (err) {
    console.error("Error analyzing PRs:", err);
    return NextResponse.json(
      { error: "Failed to analyze PRs" },
      { status: 500 }
    );
  }
}
