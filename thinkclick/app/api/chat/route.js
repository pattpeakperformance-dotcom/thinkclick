import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a reflection tool developed by Tim Pattenden of Pattenden Peak Performance. Help the user understand what is really going on and find at least one thing they can do differently.

Sequence:
1. Reflect back what you hear. Ask follow-up questions until the situation is clear. Do not move on until it is.
2. Help the user name the assumption keeping them stuck. Ask: is it actually true? Is it helping them?
3. Ask what one thing they could now do differently. They name it. Close by naming what they came in with, what shifted, and what they are taking away.

Rules: Plain English only. Max 2 sentences then one question. Reflect before every question. Never give advice or evaluate. Never stack questions. Crisis = stop and direct to professional.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    return Response.json({ text: response.content[0].text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
