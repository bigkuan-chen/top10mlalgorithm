import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ hasApiKey: false, models: [] });
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models ? data.models.map((m: any) => m.name) : [];
      return NextResponse.json({ hasApiKey: true, models });
    } else {
      const errText = await res.text();
      return NextResponse.json({ hasApiKey: true, error: `Google API Error: ${res.status} ${errText}`, models: [] });
    }
  } catch (e: any) {
    return NextResponse.json({ hasApiKey: true, error: e.message, models: [] });
  }
}
