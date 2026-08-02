-- ================================================================
-- CREATOR AI HUB — EXPANSION PACK (10 NEW AI VIDEO TOOLS)
-- ================================================================
-- این کد را در بخش SQL Editor در پنل Supabase کپی و دکمه Run را بزنید
-- (این اسکریپت ۱۰ ابزار جدید را بدون دست زدن به ۱۰ ابزار قبلی اضافه می‌کند)
-- ================================================================

INSERT INTO public.tools (
  name, slug, tagline, description, url, affiliate_url, logo, cover_image, category, pricing, starting_price, rating, reviews_count, is_featured, has_founder_badge, tags, metrics, status
) VALUES 
(
  'InVideo AI', 'invideo-ai', 'Turn any text prompt into a published YouTube video with voiceover',
  'All-in-one AI video generator that creates scripts, selects stock footage, adds subtitles, and applies realistic voiceovers from a simple text prompt.',
  'https://invideo.io', 'https://invideo.io/?ref=creatoraihub',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
  'Video Editing', 'Freemium', '$20/mo', 4.8, 890, true, true,
  ARRAY['Text to Video', 'YouTube Automation', 'Faceless Video', 'AI Scripting'], '15M+ Creators', 'approved'
),
(
  'Captions.ai', 'captions-ai', 'AI-powered camera app, teleprompter, and viral dynamic subtitles',
  'The premier iOS, Mac, and web app for talking-head videos. Automatically adds dynamic captions, eye-contact correction, and AI color grading.',
  'https://www.captions.ai', 'https://www.captions.ai?via=creatoraihub',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
  'Shorts & Reels', 'Freemium', '$9.99/mo', 4.9, 1120, true, true,
  ARRAY['Dynamic Captions', 'Eye Contact AI', 'Teleprompter', 'iOS App'], 'Alex Hormozi Style', 'approved'
),
(
  'Luma Dream Machine', 'luma-dream-machine', 'High-quality cinematic 3D AI video generation from text & images',
  'Generate fast, physically accurate 5-second cinematic B-roll clips and motion sequences for your YouTube documentaries and creative edits.',
  'https://lumalabs.ai/dream-machine', NULL,
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  'Video Editing', 'Freemium', '$29/mo', 4.8, 640, false, false,
  ARRAY['Text to Video', 'Dream Machine', 'Cinematic B-Roll', '3D AI'], 'Realistic Physics', 'approved'
),
(
  'Munch (GetMunch)', 'getmunch', 'AI content repurposing that extracts top clips from podcasts',
  'Extracts the most engaging moments from long-form YouTube podcasts and interviews using AI trend analysis and keyword virality scoring.',
  'https://www.getmunch.com', 'https://www.getmunch.com/?utm_campaign=creatoraihub',
  'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
  'Shorts & Reels', 'Paid', '$49/mo', 4.7, 430, false, true,
  ARRAY['Content Repurposing', 'Podcast Clipping', 'Trend Analysis', 'TikTok'], 'AI Trend Scoring', 'approved'
),
(
  'Riverside.fm AI', 'riverside-fm', 'Studio-quality 4K video podcast recording & instant AI transcripts',
  'Record remote video podcasts in uncompressed 4K audio/video. Features AI Magic Clips that automatically turn episodes into shareable Shorts.',
  'https://riverside.fm', 'https://riverside.fm/?via=creatoraihub',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
  'Voice & Audio', 'Freemium', '$15/mo', 4.9, 870, false, true,
  ARRAY['4K Recording', 'Podcast Studio', 'AI Magic Clips', 'Remote Interview'], '4K Uncompressed', 'approved'
),
(
  'Topaz Video AI', 'topaz-video-ai', 'Professional 4K/8K AI video upscaler, frame enhancer, & slow-mo',
  'Desktop software for serious video editors to upscale 1080p footage to crisp 4K/60fps, stabilize shaky camera shots, and reduce compression noise.',
  'https://www.topazlabs.com/topaz-video-ai', NULL,
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'Video Editing', 'Paid', '$299 (One-time)', 4.9, 720, false, false,
  ARRAY['Video Upscaler', '4K 60fps', 'AI Stabilization', 'Desktop App'], 'One-Time License', 'approved'
),
(
  'Fliki AI', 'fliki-ai', 'Turn blog posts, scripts, and tweets into narrated YouTube videos',
  'Fast text-to-video platform with 2000+ realistic TTS voices and rich stock media library. Perfect for automated YouTube news & finance channels.',
  'https://fliki.ai', 'https://fliki.ai/?via=creatoraihub',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  'Script & SEO', 'Freemium', '$21/mo', 4.7, 510, false, true,
  ARRAY['Blog to Video', 'AI Voiceovers', 'Stock Video', 'YouTube Automation'], '2000+ Voices', 'approved'
),
(
  'Kling AI Video', 'kling-ai', 'High-end 1080p AI video generation with realistic motion control',
  'Advanced AI video generator offering up to 2-minute cinematic clips with exceptional physical motion accuracy and prompt adherence.',
  'https://klingai.com', NULL,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  'Video Editing', 'Freemium', '$10/mo', 4.8, 380, false, false,
  ARRAY['Kling AI', 'Text to Video', 'Cinematic B-Roll', 'Motion Control'], '1080p Cinematic', 'approved'
),
(
  'Syllaby.io', 'syllaby-io', 'AI YouTube scriptwriter and automated content calendar for lawyers & agencies',
  'Discovers profitable video topics, writes high-retention video scripts, and creates AI avatar videos tailored for professional service creators.',
  'https://syllaby.io', 'https://syllaby.io/?via=creatoraihub',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'Script & SEO', 'Paid', '$49/mo', 4.6, 290, false, true,
  ARRAY['AI Scriptwriter', 'Content Calendar', 'Lead Generation', 'YouTube SEO'], 'Agency Favorite', 'approved'
),
(
  'CapCut PC & Web AI', 'capcut-ai', 'The all-in-one free video editor with AI script-to-video & auto-cut',
  'World-class free desktop and mobile editor with AI auto-captions, vocal isolation, background removal, and TikTok trend templates.',
  'https://www.capcut.com', NULL,
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
  'Shorts & Reels', 'Freemium', '$9.99/mo Pro', 4.9, 2100, false, false,
  ARRAY['Free Editor', 'Auto-Captions', 'TikTok Editor', 'Desktop & Mobile'], '200M+ Creators', 'approved'
)
ON CONFLICT (slug) DO NOTHING;
