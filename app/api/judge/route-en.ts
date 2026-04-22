/**
 * ─────────────────────────────────────────────────────────────
 * JUDGMENT CONSOLE — API Route
 * Path   : app/api/judge/route.ts
 * Author : Andrê
 *
 * Runs server-side only. ANTHROPIC_API_KEY never reaches
 * the browser. The component calls /api/judge, not
 * api.anthropic.com directly.
 *
 * Setup:
 *   1. Create `.env.local` at your project root
 *   2. Add: ANTHROPIC_API_KEY=sk-ant-xxxxxxx
 *   3. Confirm `.env.local` is in your `.gitignore`
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { idea } = await req.json();

  if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
    return NextResponse.json({ error: "Idea is required." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in environment variables.");
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are the Judgment Console — a critical idea evaluation system.
Analyze the idea presented and respond ONLY with valid JSON, no extra text, no backticks, no markdown.

Exact structure:
{
  "score": <integer 0-100>,
  "headline": "<short verdict phrase, max 60 chars>",
  "alive": "<what has real potential, 1-2 direct sentences>",
  "generic": "<what is shallow or generic, 1-2 direct sentences>",
  "push": "<how to push further, 1-2 incisive sentences>",
  "callout": "<most important insight, single high-impact sentence>"
}`,
        messages: [
          { role: "user", content: `Idea: ${idea.trim()}` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Upstream API error." }, { status: 502 });
    }

    const data = await response.json();
    const raw  = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Judge route error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
