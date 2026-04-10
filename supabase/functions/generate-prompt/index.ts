import { corsHeaders } from "@supabase/supabase-js/cors";

const STYLE_MODIFIERS: Record<string, string> = {
  realistic:
    "Focus on hyper-realistic photography details: exact skin textures, pore visibility, natural light behavior, lens-accurate bokeh and depth of field.",
  advertising:
    "Focus on advertising/marketing aesthetics: high-impact visual composition, bold colors, direct eye contact, strong call-to-action energy, commercial-grade lighting, polished skin retouching.",
  cinematic:
    "Focus on cinematic look: film grain, anamorphic lens characteristics, dramatic lighting with deep shadows, movie color grading (teal & orange), wide aspect ratio feel.",
  instagram:
    "Focus on Instagram/social media aesthetics: warm tones, golden hour feel, trendy editing style, lifestyle mood, clean backgrounds, influencer-level polish.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, style, mode } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = `You are an expert image analysis AI specialized in generating extremely detailed prompts for AI image generation tools (Midjourney, DALL-E, Stable Diffusion).

When given an image, analyze EVERY element with maximum detail and produce a single continuous prompt in English that follows this structure:

1. IMAGE TYPE (e.g., hyper-realistic photograph, professional portrait, fashion editorial)
2. PERSON DESCRIPTION (if present): gender, approximate age, skin tone, face shape, facial structure, eyes (color, shape, expression), nose, mouth, hair (color, texture, length, style)
3. EXPRESSION & EMOTION: confidence, seductiveness, naturalness, smile, serious gaze, etc.
4. POSE & FRAMING: body position, camera angle, shot type (close-up, half-body, full-body), gaze direction
5. COMPLETE OUTFIT: clothing type, color, fabric, body fit, style (casual, elegant, fitness, sensual)
6. ACCESSORIES: earrings, necklaces, glasses, watches, etc.
7. SETTING: environment (indoor/outdoor), location, background elements
8. LIGHTING: type (natural, studio, neon, golden hour), direction, intensity
9. QUALITY & STYLE: ultra-realistic, 4K/8K, depth of field, camera lens (50mm, 85mm), visual style
10. EXTRA DETAILS: textures, shadows, reflections, image mood

CRITICAL RULES:
- Output MUST be a single continuous paragraph in English
- Be EXTREMELY detailed — maximum possible level of description
- NEVER produce generic prompts
- Focus on faithfully recreating the reference image
- Use professional, technical, descriptive language
- Avoid any ambiguity
- Include camera/lens specifications when applicable`;

    if (style && STYLE_MODIFIERS[style]) {
      systemPrompt += `\n\nSTYLE EMPHASIS: ${STYLE_MODIFIERS[style]}`;
    }

    if (mode === "refine") {
      systemPrompt += `\n\nIMPORTANT: This is a REFINEMENT pass. Make the prompt even MORE detailed than before. Add micro-details about textures, light reflections, fabric folds, skin details, environmental elements, and atmospheric qualities. Push the detail level to the absolute maximum.`;
    }

    if (mode === "ad") {
      systemPrompt += `\n\nIMPORTANT: Adapt this prompt for HIGH-CONVERSION ADVERTISING:
- Make the expression more attention-grabbing and confident
- Emphasize direct eye contact with the viewer
- Use strong, contrasting colors and bold lighting
- Add commercial/marketing polish
- Focus on elements that drive viewer engagement and conversion
- Make it look like a premium brand advertisement`;
    }

    const mimeMatch = imageBase64.match(/^data:(image\/\w+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Data}` },
              },
              {
                type: "text",
                text: "Analyze this image in extreme detail and generate the most comprehensive prompt possible to recreate it with AI image generation.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const prompt = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
