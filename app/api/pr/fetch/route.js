import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { repoUrl } = await req.json();
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: process.env.GITHUB_TOKEN
            ? `token ${process.env.GITHUB_TOKEN}`
            : undefined,
        },
      }
    );

    return NextResponse.json({
      message: "PRs fetched successfully",
      totalPRs: response.data.length,
      sampleData: response.data.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching PRs:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
