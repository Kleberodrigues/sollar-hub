/**
 * Test OpenAI API Connection
 * Temporary endpoint for debugging
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "OPENAI_API_KEY not configured"
    }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas com JSON: {"test": "ok"}',
          },
        ],
        max_tokens: 50,
      }),
    });

    const status = response.status;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status,
        error: data.error?.message || 'API error',
        details: data
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status,
      model: 'gpt-4.1-mini-2025-04-14',
      response: data.choices?.[0]?.message?.content,
      usage: data.usage
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
