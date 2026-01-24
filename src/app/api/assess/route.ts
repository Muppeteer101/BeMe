import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { DamageAssessment } from '@/types/assessment';
import { setAssessment } from '@/lib/store';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert automotive damage assessor with decades of experience in collision repair, body work, and mechanical assessment. You analyze images of damaged vehicles and provide detailed, professional assessments.

When analyzing vehicle damage images, you must:
1. Identify all visible damage to body panels, glass, lights, trim, and structural components
2. Assess the severity of each type of damage
3. Determine if parts need repair or replacement
4. Estimate costs for parts and labor based on typical US market rates
5. Identify potential hidden damage that may not be visible
6. Assess if the vehicle is safe to drive
7. Recommend the skill level required for repairs
8. Compare repair costs to vehicle market value

Always respond with a valid JSON object matching this exact structure:
{
  "vehicleInfo": {
    "year": number or null,
    "make": string or null,
    "model": string or null,
    "detectedFromImage": boolean
  },
  "summary": {
    "overallSeverity": "Minor" | "Moderate" | "Severe" | "Critical",
    "primaryDamageType": string,
    "estimatedRepairDifficulty": "DIY" | "Intermediate" | "Professional",
    "safetyImpact": "None" | "Minor" | "Significant" | "Critical",
    "driveable": boolean,
    "summaryText": string (2-3 sentences summarizing the damage)
  },
  "damagedParts": [
    {
      "name": string,
      "location": string,
      "damageType": string,
      "severity": "Minor" | "Moderate" | "Severe" | "Critical",
      "repairOrReplace": "Repair" | "Replace",
      "estimatedPartCost": { "low": number, "high": number },
      "estimatedLaborCost": { "low": number, "high": number },
      "laborHours": { "low": number, "high": number },
      "skillRequired": "DIY" | "Intermediate" | "Professional",
      "notes": string or null
    }
  ],
  "hiddenDamage": [
    {
      "potentialIssue": string,
      "likelihood": "Low" | "Medium" | "High",
      "description": string,
      "estimatedAdditionalCost": { "low": number, "high": number },
      "recommendedInspection": string
    }
  ],
  "costBreakdown": {
    "partsCostLow": number,
    "partsCostHigh": number,
    "laborCostLow": number,
    "laborCostHigh": number,
    "totalCostLow": number,
    "totalCostHigh": number,
    "hiddenDamageCostLow": number,
    "hiddenDamageCostHigh": number,
    "grandTotalLow": number,
    "grandTotalHigh": number
  },
  "marketValueComparison": {
    "estimatedMarketValue": { "low": number, "high": number, "average": number },
    "repairToValueRatio": number (decimal, e.g., 0.35 for 35%),
    "recommendation": "Economical to Repair" | "Borderline" | "Consider Total Loss",
    "explanation": string
  },
  "repairRecommendations": [string],
  "safetyWarnings": [string]
}

Be thorough but realistic with estimates. Use typical US market rates for parts and labor ($75-150/hour for body work, $100-175/hour for mechanical work).`;

interface ImageData {
  data: string;
  mediaType: string;
}

interface AssessmentRequestBody {
  images: ImageData[];
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequestBody = await request.json();
    const { images, vehicleInfo } = body;

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Build the content array with images
    const imageContent: Anthropic.ImageBlockParam[] = images.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: img.data,
      },
    }));

    // Build the user message
    let userPrompt = 'Please analyze these images of vehicle damage and provide a comprehensive assessment.';

    if (vehicleInfo && (vehicleInfo.year || vehicleInfo.make || vehicleInfo.model)) {
      userPrompt += `\n\nVehicle information provided by the user:`;
      if (vehicleInfo.year) userPrompt += `\n- Year: ${vehicleInfo.year}`;
      if (vehicleInfo.make) userPrompt += `\n- Make: ${vehicleInfo.make}`;
      if (vehicleInfo.model) userPrompt += `\n- Model: ${vehicleInfo.model}`;
    }

    userPrompt += '\n\nProvide your assessment as a JSON object following the exact structure specified.';

    // Call Claude API with vision
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
    });

    // Extract the response text
    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Parse the JSON response
    let assessmentData;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, responseText];

      const jsonString = jsonMatch[1] || responseText;
      assessmentData = JSON.parse(jsonString.trim());
    } catch {
      console.error('Failed to parse assessment response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse assessment results' },
        { status: 500 }
      );
    }

    // Create the full assessment object
    const assessmentId = uuidv4();
    const assessment: DamageAssessment = {
      id: assessmentId,
      createdAt: new Date().toISOString(),
      ...assessmentData,
      imageUrls: [], // Images are not stored in this demo
    };

    // Store the assessment
    setAssessment(assessmentId, assessment);

    return NextResponse.json({
      assessmentId,
      success: true,
    });
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}
