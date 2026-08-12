import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { consumeDailyQuota } from '@/lib/quotaStore';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAllOrders } from '@/lib/ordersStore';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Resolve the caller's identity SERVER-SIDE. The quota identifier can never
 * come from the request body unverified — previously a forged `email` field
 * minted a fresh free quota per request (2026-08-12 audit).
 *
 *  - Signed-in users: Bearer token verified against Supabase Auth; identifier
 *    is the user id, and Pro status comes from confirmed studio orders.
 *  - Anonymous users: identifier is the requester IP.
 */
async function resolveIdentity(request: Request): Promise<{ identifier: string; isPro: boolean; email: string | null }> {
  const ip = clientIp(request);
  const fallback = { identifier: `ip:${ip}`, isPro: false, email: null as string | null };

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token || !supabaseAdmin) return fallback;

  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    const email = data.user?.email?.toLowerCase();
    if (!data.user || !email || !EMAIL_RE.test(email)) return fallback;

    let isPro = false;
    try {
      const orders = await getAllOrders();
      isPro = orders.some(
        (o) =>
          o.founder_email.toLowerCase() === email &&
          o.status === 'confirmed' &&
          (o.plan === 'studio-monthly' || o.plan === 'studio-yearly')
      );
    } catch {
      isPro = false;
    }

    return { identifier: `user:${data.user.id}`, isPro, email };
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  if (!rateLimit(`ai-gen-minute:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { tool, prompt, topic, category, platform = 'YouTube', style = 'Viral Hook' } = body;

    const identity = await resolveIdentity(request);
    const quota = await consumeDailyQuota(identity.identifier, identity.isPro);

    if (quota.limitReached) {
      return NextResponse.json(
        {
          error: `Daily limit of ${quota.limit} AI generations reached (سقف استفاده روزانه تکمیل شد). Upgrade to Studio Pro for 50 runs/day!`,
          limitReached: true,
          quota,
        },
        { status: 429 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
    const groqKey = process.env.GROQ_API_KEY?.trim() || '';
    const openrouterKey = process.env.OPENROUTER_API_KEY?.trim() || '';
    const openaiKey = process.env.OPENAI_API_KEY?.trim() || '';

    // 1. Try Google Gemini API (100% Free with 1,500 requests/day)
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert AI video production strategist for YouTubers and video editors.
Generate ultra-high-converting, viral outputs for tool "${tool}".
Topic/Input: ${prompt || topic || category}
Target Platform: ${platform}
Style: ${style}
Format response in clean, formatted Markdown without intro conversational filler.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({
              success: true,
              source: 'Google Gemini 1.5 Flash (Free Tier)',
              result: text,
              quota,
            });
          }
        }
      } catch {
        /* fallback */
      }
    }

    // 2. Try Groq API (100% Free & Fast Llama 3)
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an expert AI video production strategist. Generate viral, high-converting outputs for ${tool}. Respond in clean markdown.`,
              },
              {
                role: 'user',
                content: `Topic: ${prompt || topic || category} | Platform: ${platform} | Style: ${style}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (groqRes.ok) {
          const grData = await groqRes.json();
          const text = grData.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({
              success: true,
              source: 'Groq Llama 3.3 (Free)',
              result: text,
              quota,
            });
          }
        }
      } catch {
        /* fallback */
      }
    }

    // 3. Try OpenRouter
    if (openrouterKey) {
      try {
        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openrouterKey}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [
              {
                role: 'system',
                content: `You are an expert AI video production strategist. Generate viral, high-converting outputs for ${tool}. Respond in clean markdown.`,
              },
              {
                role: 'user',
                content: `Topic: ${prompt || topic || category} | Platform: ${platform} | Style: ${style}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const text = orData.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({
              success: true,
              source: 'OpenRouter Free Model',
              result: text,
              quota,
            });
          }
        }
      } catch {
        /* fallback */
      }
    }

    // 4. Try OpenAI if set
    if (openaiKey) {
      try {
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert AI video strategist. Generate viral outputs for ${tool}.`,
              },
              {
                role: 'user',
                content: `Topic: ${prompt || topic || category} | Platform: ${platform} | Style: ${style}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (oaiRes.ok) {
          const oaiData = await oaiRes.json();
          const text = oaiData.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({
              success: true,
              source: 'OpenAI GPT-4o-mini',
              result: text,
              quota,
            });
          }
        }
      } catch {
        /* fallback */
      }
    }

    // Heuristic Engine fallback (100% offline & instant)
    const result = generateCreatorTemplate(tool, prompt || topic, platform, style);

    return NextResponse.json({
      success: true,
      source: 'Studio Smart Engine',
      result,
      quota,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

function generateCreatorTemplate(
  tool: string,
  input: string = 'AI Tools Revolution',
  platform: string,
  style: string
): string {
  const cleanInput = input.trim() || 'AI Tools Revolution';

  switch (tool) {
    case 'prompt-builder':
      return `### 🎬 Cinematic Midjourney & Sora Prompt Pack

**Prompt 1 (Cinematic 8K Photorealistic):**
\`\`\`text
Hyper-realistic cinematic shot of ${cleanInput}, dynamic low-angle lighting, volumetric golden hour haze, shot on 35mm Arri Alexa LF, anamorphic lens, shallow depth of field, photorealistic 8K render, Octane render, unreal engine 5 style --ar 16:9 --v 6.1 --style raw --q 2
\`\`\`

**Prompt 2 (Cyberpunk / Studio Neon):**
\`\`\`text
Sleek modern YouTube studio setup highlighting ${cleanInput}, glowing cyan and magenta studio keylights, diffused softbox reflections, high-tech creator aesthetic, ultra-detailed textures --ar 16:9 --v 6.1
\`\`\`

**Negative Prompt:**
\`blurry, low quality, deformed hands, distorted face, oversaturated, watermark, grainy, text\``;

    case 'thumbnail-brief':
      return `### 🎨 Viral YouTube Thumbnail Strategy Brief

**1. Main Focal Subject:**
* High-emotion facial expression (Intense Curiosity or Extreme Shock) placed on the **left side (Rule of Thirds)**.
* Rim lighting with vibrant **Cyan (#22d3ee)** or **Electric Amber (#f59e0b)** hair-light to pop off the dark background.

**2. Visual Contrast & Foreground Element:**
* Giant glowing 3D icon or badge representing: **"${cleanInput}"**.
* Floating dollar sign or virality multiplier (e.g. \`10X FASTER\`) with a strong drop shadow.

**3. Thumbnail Overlay Text (3 Words Max):**
* **"THIS CHANGES EVERYTHING"** or **"DON'T MISS THIS"**
* Font: Bold Heavy Sans (Bebas Neue / Montserrat Black), White text on deep Red / Gold background banner.

**4. CTR Virality Score:** **9.2 / 10** (High Curiosity Gap)`;

    case 'thumbnail-text':
      return `### ⚡ 10 High-CTR Viral Title & Thumbnail Text Formulas

**Title Options (Ranked by Click-Through-Rate):**
1. **I Tested 100 AI Video Tools — Only 3 Are Worth It (${cleanInput})**
2. **Why Everyone is Secretly Using ${cleanInput} in 2026…**
3. **How I Make 10x More Videos in Half the Time with ${cleanInput}**
4. **Stop Wasting Hours Editing! Use This AI Workflow Instead**
5. **The ${cleanInput} Strategy Big YouTubers Don't Want You to Know**

**Thumbnail Text Banners (Short & Punchy):**
* \`IT'S FINALLY HERE!\`
* \`GAME OVER.\`
* \`SECRET AI HACK\`
* \`10X VIEWS\``;

    case 'content-calendar':
      return `### 📅 7-Day High-Retention Video Production Schedule

**Day 1 (Monday — The Viral Hook):**
* **Topic:** "The single biggest mistake creators make with ${cleanInput}"
* **Format:** 45s YouTube Short / TikTok
* **Hook:** *"If you are still doing this manually, you are losing 10 hours every week..."*

**Day 2 (Tuesday — The Tutorial Breakdown):**
* **Topic:** "Step-by-step setup for ${cleanInput}"
* **Format:** 8-minute long-form YouTube video + Screen recording walkthrough.

**Day 3 (Wednesday — The Side-by-Side Test):**
* **Topic:** "${cleanInput} vs Top Competitor — Real Output Test"
* **Hook:** *"I put both tools to the test with the exact same 4K brief. Here's the truth."*

**Day 4 (Thursday — Quick Shorts Tip):**
* **Topic:** "3 hidden features you missed in ${cleanInput}"

**Day 5 (Friday — Case Study & Results):**
* **Topic:** "How this video got 500k views using AI"

**Day 6-7 (Weekend — Engagement & Community Post):**
* **Action:** Poll audience on their favorite workflow bottleneck.`;

    default:
      return `### 🚀 Generated AI Creator Output for ${tool}

**Project Topic:** ${cleanInput}
**Platform:** ${platform}
**Style:** ${style}

**Key Strategic Takeaway:**
To maximize retention in 2026, keep your intro hook under 3 seconds, introduce visual pattern interrupts every 4–6 seconds, and pair dynamic animated captions with sound design accents.`;
  }
}
