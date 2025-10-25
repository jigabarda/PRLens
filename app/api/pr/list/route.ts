// app/api/pr/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pulls = await prisma.pullRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pulls });
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return NextResponse.json({ error: "Failed to fetch PRs" }, { status: 500 });
  }
}
