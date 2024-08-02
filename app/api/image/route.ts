import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkApiLimt , increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "256x256" } = body as {
      prompt: unknown;
      amount?: number;
      resolution?: string;
    };

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    if (typeof prompt !== 'string' || prompt.trim() === '') {
      return new NextResponse("Prompt is required and must be a non-empty string", { status: 400 });
    }

    const parsedAmount = Math.max(1, Math.min(10, parseInt(amount.toString(), 10) || 1));
    const validResolutions = ["256x256", "512x512", "1024x1024"] as const;
    const parsedResolution = validResolutions.includes(resolution as any) 
      ? resolution as "256x256" | "512x512" | "1024x1024"
      : "256x256";

      const freeTrial = await checkApiLimt();

      const isPro = await checkSubscription();
  
      if ( !freeTrial && !isPro ) {
        return new NextResponse("Free Trial has expired", { status: 403 });
      }

    const response = await openai.images.generate({
      prompt: prompt.trim(),
      n: parsedAmount,
      size: parsedResolution,
    });

    if ( !isPro ) {
      await increaseApiLimit();
    }
    
    return NextResponse.json(response.data);

  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}