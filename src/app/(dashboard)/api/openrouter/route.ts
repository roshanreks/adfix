import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function getOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error("OPENROUTER_API_KEY environment variable is required");
  }
  return key;
}

export async function POST(req: NextRequest) {
  let OPENROUTER_KEY: string;
  try {
    OPENROUTER_KEY = getOpenRouterKey();
  } catch {
    return NextResponse.json(
      { error: "OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { prompt, model = "meta-llama/llama-3.1-70b-instruct:free" } = body;

    // Input validation
    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required and must be a non-empty string" }, { status: 400 });
    }
    if (prompt.length > 8000) {
      return NextResponse.json({ error: "Prompt exceeds maximum length of 8000 characters" }, { status: 400 });
    }
    const allowedModels = [
      "meta-llama/llama-3.1-70b-instruct:free",
      "meta-llama/llama-3.1-70b-instruct",
      "anthropic/claude-3-haiku",
      "google/gemini-flash-1.5",
    ];
    if (typeof model !== "string" || !allowedModels.includes(model)) {
      return NextResponse.json({ error: "Invalid model specified" }, { status: 400 });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://adfixapp.in",
        "X-Title": "AdFix Audit Platform",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert digital marketing analyst specializing in Meta Ads performance. You provide concise, actionable insights in 2-3 sentences. Be direct and data-driven.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ content, model });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
