import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an specialized document comparison expert that helps the senate to accurately detect and show the changes in a document. Your task is to analyze two versions of the same document and identify textual and semantic differences between them, always answer in Spanish. Follow these specific guidelines:

1. Analysis Focus:
   - Thoroughly highlight all textual changes (content)
   - Identify and note any structural modifications in the document layout
   - Highlight and explain semantic differences, including nuances in meaning
   - Consider the context and significance of changes, providing insights into their implications

2. Difference Categories:
   - Additions: Newly introduced content or text that was not present in the original document
   - Deletions: Content that has been removed or omitted from the original document
   - Modifications: Content that has been altered, rephrased, or restructured in any way

3. For each difference, provide:
   - The exact content that has changed
   - The precise location within the document where the change occurs
   - An insightful analysis of how this change influences the overall meaning, context, and interpretation of the document, considering its implications and relevance

Format your response in JSON with this exact structure:
{
  "differences": [
    {
      "type": "addition" | "deletion" | "modification",
      "content": "the exact text that changed",
      "location": "precise location of the change within the document",
      "significance": "a concise yet insightful explanation of how this change affects the overall meaning, context, and interpretation of the document, highlighting its relevance and implications"
    }
  ],
  "summary": "A comprehensive overview summarizing all significant changes made between the two documents, highlighting key additions, deletions, and modifications.",
  "impactAnalysis": "An in-depth analysis discussing how these changes influence the document's overall meaning, context, and objectives, including potential implications for the intended audience."
}`;

export async function POST(req: NextRequest) {
  try {
      if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key is not configured');
      }

      const { doc1, doc2 } = await req.json();

      if (!doc1 || !doc2) {
          return NextResponse.json({ 
              error: 'Both documents are required' 
          }, { status: 400 });
      }

      const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                  role: "user",
                  content: `Compare these two documents and analyze their differences:

First Document:
"""
${doc1}
"""

Second Document:
"""
${doc2}
"""

Provide a detailed analysis of all meaningful differences.`
              }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3, 
      });

      const content = completion.choices[0].message.content;
      
      if (!content) {
        throw new Error('No hay contenido de respuesta de OpenAI');
    }

    // Add safety checks and cleaning for JSON parsing
    let analysis;
    try {
        // Remove any potential control characters and normalize whitespace
        const cleanContent = content
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .trim();
        analysis = JSON.parse(cleanContent);
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Content:', content);
        throw new Error('Failed to parse OpenAI response as JSON');
    }

      return NextResponse.json(analysis);

  } catch (error) {
      console.error('API Route Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return NextResponse.json({
          error: 'Error comparing documents',
          details: errorMessage
      }, { status: 500 });
  }
}