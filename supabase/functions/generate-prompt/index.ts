const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { imageBase64, style, mode, age } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = `You are an expert image analysis AI specialized in generating extremely detailed prompts for AI image generation tools (Midjourney, DALL-E, Stable Diffusion).

When given an image, analyze EVERY element with maximum detail and produce a single continuous prompt in English that follows this EXACT structure and format:

FACIAL IDENTITY REFERENCE — [GENDER]: @img1 + @img2 — Use for 100% facial likeness fidelity. Reproduce exact facial features, skin tone, hair color, hair texture, hair length, eye shape, nose, lips, and bone structure. Do NOT describe the facial features from the photo — always use the @img1 + @img2 references for identity. Only capture the EXPRESSION (smile, gaze direction, emotion) from the analyzed photo.
BODY REFERENCE — [GENDER]: @img3 — Use for 100% body likeness fidelity. Reproduce exact body proportions, silhouette, frame, and figure from @img3. Do NOT describe body traits from the photo — only capture the POSE and body positioning from the analyzed photo.
[Overall scene description — ultra-realistic professional photography type, subject description, age, setting context.]
POSE & EXPRESSION: [Describe in extreme detail the exact pose, body position, arm/hand placement, leg positioning, camera angle, gaze direction, facial expression/emotion, head tilt, composition framing, and focus areas AS SEEN in the reference photo. This section captures HOW the person is positioned and WHAT expression they have.]
HANDS & NAILS: [Detailed hand description — exact hand positions, what they are holding, finger placement, nails style, color, rings, jewelry, skin quality.]
OUTFIT: [Detailed clothing description — type, color, fabric, fit, style, visible body areas.]
ACCESSORIES: [Any accessories — earrings, necklaces, glasses, watches, bracelets, etc.]
CANDLES: [If birthday candles are present, describe them in detail — numbers, material, color, flame, positioning in hands.]
BACKGROUND: [Environment description — studio/outdoor, colors, bokeh, mood, atmosphere.]
LIGHTING: [Light type, direction, intensity, skin highlights, mood created by lighting.]
Camera: [Lens mm, aperture, shot type, focus areas, angle, color palette summary, aspect ratio, quality specs like 8K, photorealistic, no watermarks.]

CRITICAL RULES:
- Follow the EXACT section format above with labeled headers
- FACIAL and BODY identity ALWAYS come from @img1, @img2, @img3 — NEVER describe facial features or body proportions from the analyzed photo
- FROM the analyzed photo, capture ONLY: expression, emotion, pose, body positioning, hand placement, outfit, accessories, background, lighting, and camera details
- Be EXTREMELY detailed in every section — maximum possible level of description
- NEVER produce generic prompts
- Use professional, technical, descriptive language
- Avoid any ambiguity
- Always end with camera/lens specifications, color palette, aspect ratio, and quality specs`;

    if (age) {
      const digits = String(age).split("");
      const digitDesc = digits.length === 2
        ? `left hand holds a "${digits[0]}" candle and right hand holds a "${digits[1]}" candle`
        : digits.length === 1
        ? `holding a single "${digits[0]}" candle`
        : `holding candles showing "${age}"`;
      systemPrompt += `\n\nCRITICAL AGE INSTRUCTION — MANDATORY:
- The subject is EXACTLY ${age} years old. Replace ANY age mentioned with ${age}.
- ALL number candles, balloon numbers, cake numbers, or ANY numeric element in the scene MUST be changed to show ${age}.
- For candles: ${digitDesc}. IGNORE the original numbers on candles/balloons in the photo.
- For balloons: replace any number balloons with balloons showing "${age}" or individual digit balloons "${digits.join('" and "')}".
- Always write "${age} years old" in the scene description.
- This overrides EVERYTHING you see in the image regarding age and numbers.`;
    }

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
