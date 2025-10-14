import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { prompt, file } = await req.json()

  // For now, fake response until AI connected
  const output = `✨ Directr received:
- Prompt: ${prompt || 'none'}
- File: ${file || 'no upload'}
Next: AI analysis + clip/plan generation.`

  return NextResponse.json({ output })
}
