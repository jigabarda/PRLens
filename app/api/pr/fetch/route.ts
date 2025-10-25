// app/api/pr/fetch/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    const parts = repoUrl.split("/");
    const owner = parts[3];
    const repo = parts[4];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=5`;

    const response = await fetch(apiUrl);
    const pulls = await response.json();

    if (!Array.isArray(pulls)) {
      return NextResponse.json(
        { error: "Invalid response from GitHub" },
        { status: 400 }
      );
    }

    // Save to database
    for (const pr of pulls) {
      await prisma.pullRequest.upsert({
        where: { url: pr.html_url },
        update: {}, // skip update if exists
        create: {
          title: pr.title,
          url: pr.html_url,
          state: pr.state,
          author: pr.user?.login || "Unknown",
        },
      });
    }

    return NextResponse.json({
      message: "PRs fetched and saved successfully",
      totalPRs: pulls.length,
      sampleData: pulls.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return NextResponse.json(
      { error: "Failed to fetch and save PRs" },
      { status: 500 }
    );
  }
}
