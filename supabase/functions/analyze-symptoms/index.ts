import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, symptomAnswers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a medical AI assistant specialized in cholera assessment. 
You will receive a patient's free-text description of how they feel, and optionally structured symptom answers.

Your task is to:
1. Analyze the text for cholera-related symptoms using NLP
2. Determine the risk level: "low", "moderate", or "high"
3. Determine the stage: "no_symptoms", "early_stage", "acute_stage", "severe_stage"
4. Predict if this is likely diarrhea/cholera or not
5. Provide specific prevention tips and advice

You MUST respond by calling the analyze_symptoms function.`;

    const userMessage = `Patient description: "${description || 'No free text provided'}"

Structured symptom answers: ${JSON.stringify(symptomAnswers || {})}

Analyze the symptoms and provide your assessment.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_symptoms",
              description: "Return structured cholera risk assessment",
              parameters: {
                type: "object",
                properties: {
                  is_diarrhea: { type: "boolean", description: "Whether symptoms indicate diarrhea" },
                  is_cholera_likely: { type: "boolean", description: "Whether cholera is likely" },
                  risk_level: { type: "string", enum: ["low", "moderate", "high"] },
                  stage: { type: "string", enum: ["no_symptoms", "early_stage", "acute_stage", "severe_stage"] },
                  stage_description: { type: "string", description: "Description of what this stage means" },
                  score: { type: "number", description: "Risk score from 0 to 100" },
                  summary: { type: "string", description: "2-3 sentence assessment summary" },
                  detected_symptoms: { type: "array", items: { type: "string" }, description: "List of detected symptoms from the text" },
                  advice: { type: "array", items: { type: "string" }, description: "4-5 specific medical recommendations" },
                  prevention_tips: { type: "array", items: { type: "string" }, description: "4-5 prevention tips" },
                  urgent_referral: { type: "boolean", description: "Whether urgent medical referral is needed" },
                },
                required: ["is_diarrhea", "is_cholera_likely", "risk_level", "stage", "stage_description", "score", "summary", "detected_symptoms", "advice", "prevention_tips", "urgent_referral"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_symptoms" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-symptoms error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
