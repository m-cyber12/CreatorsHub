#!/usr/bin/env python3
"""Adds the `studio` and `components` UI namespaces to messages/en.json and
mirrors them (English placeholders) into the other 7 locale files, so the
Google-bootstrap + professional-engine pipeline can fill them."""
import json, os

LOCALES = ['en', 'es', 'pt', 'fr', 'de', 'zh', 'ar', 'fa']

UI = {
  "studio": {
    "browserOnly": "Browser-only · no API",
    "backToStudio": "AI Studio",
    "navAria": "Studio writing utilities",
    "signIn": "Sign in",
    "accessBanner": "Sign in to use every Studio utility — free during launch.",
    "accessActive": "Studio access active · all utilities are free and unlimited during launch.",
    "runGate": "Sign in is required before using this Studio utility.",
    "inBuild": "In build",
    "openUtility": "Open utility",
    "nav": {
      "promptBuilder": "Prompt Builder",
      "thumbnailBrief": "Thumbnail Brief",
      "thumbnailText": "Thumbnail Text",
      "contentCalendar": "Content Calendar",
      "imageTools": "Image Tools",
      "subtitleTools": "Subtitle Tools",
      "audioTrimmer": "Audio Trimmer",
      "videoInspector": "Video Inspector"
    },
    "pb": {
      "buildBrief": "Build your brief",
      "reset": "Reset",
      "outputType": "Output type",
      "mainSubject": "Main subject or message",
      "subjectPlaceholder": "e.g. A creator explaining how they grew a cooking channel",
      "audience": "Audience",
      "audiencePlaceholder": "e.g. New food creators who publish weekly",
      "styleTone": "Style / tone",
      "platform": "Platform",
      "aspectRatio": "Aspect ratio",
      "mustInclude": "Must include",
      "doNotInclude": "Do not include",
      "optional": "Optional",
      "generate": "Generate prompt set",
      "output": "Output",
      "ready": "Prompt set ready",
      "emptyHeading": "Your structured prompts will appear here",
      "ruleBased": "Rule-based · local",
      "noModel": "No model call",
      "copy": "Copy",
      "copied": "Copied",
      "copyOutput": "Copy output",
      "shortPrompt": "Short prompt",
      "standardPrompt": "Standard prompt",
      "detailedPrompt": "Detailed prompt",
      "negativePrompt": "Negative prompt",
      "emptyText": "Fill in your creative direction, then generate a reusable prompt in the browser."
    },
    "tb": {
      "setDirection": "Set the direction",
      "videoTopic": "Video topic or title",
      "targetAudience": "Target audience",
      "keyEmotion": "Key emotion",
      "focalSubject": "Face, product, or main subject",
      "styleReference": "Style reference",
      "brandColours": "Brand colours",
      "optional": "Optional",
      "optionalDescribe": "Optional — describe, do not upload",
      "optionalColours": "Optional — e.g. charcoal, cream, electric blue",
      "build": "Build thumbnail brief",
      "reset": "Reset",
      "copy": "Copy",
      "ready": "Brief ready for handoff",
      "empty": "A usable design brief will appear here",
      "designOutput": "Design output",
      "local": "Local · no image generation",
      "intro": "This produces a brief, not an image. You can hand it to a designer, Canva, or an image model.",
      "mobileChecklist": "Mobile readability checklist",
      "checklist": [
        "One clear focal subject",
        "Text remains readable at small size",
        "Remove small UI screenshots, extra faces, tiny badges, dense text, fake arrows, and visual elements that compete with the subject.",
        "The visual matches the actual video promise",
        "No unsupported claim or misleading “before/after”"
      ],
      "tips": [
        "Contrast an expected scene with one unexpected, truthful reveal.",
        "Make the expert, evidence, or result the unmistakable focal point.",
        "Show one unresolved visual clue and leave room for the viewer to ask “how?”",
        "Use a single time-sensitive cue without inventing consequences.",
        "Visually separate a credible before state from its after state."
      ]
    },
    "tt": {
      "setConstraint": "Set the constraint",
      "topic": "Topic",
      "topicPlaceholder": "e.g. editing a podcast in one hour",
      "contentType": "Content type",
      "tone": "Tone",
      "maxWords": "Maximum words",
      "generate": "Generate 15 options",
      "templatesNote": "Templates use your topic; they do not invent results, numbers, or claims.",
      "shortCopy": "Short copy",
      "ready": "15 honest starting points",
      "keepShort": "Keep it short, legible, and truthful",
      "options": "15 options",
      "wordRange": "2–6 words",
      "wordsUnit": "words",
      "empty": "Good thumbnail copy reinforces a real promise. It should never replace a truthful title with a misleading claim.",
      "copyAria": "Copy {text}",
      "groups": {
        "Hook": "Hook",
        "Curiosity": "Curiosity",
        "Result": "Result",
        "Comparison": "Comparison",
        "Urgency": "Urgency"
      }
    },
    "cc": {
      "build": "Build calendar",
      "intro": "Build a practical publishing plan from your own niche and pillars. This does not claim live trend research.",
      "niche": "Niche",
      "pillars": "Content pillars",
      "platforms": "Platforms",
      "postsPerWeek": "Posts / week",
      "calendarLength": "Calendar length",
      "format": "Format",
      "goal": "Goal",
      "topic": "Topic",
      "status": "Status",
      "addRow": "Add row",
      "copyCsv": "Copy CSV",
      "download": "Download",
      "editableOutput": "Editable output",
      "optionalComma": "Optional, comma-separated",
      "replyNote": "Reply or visit the link for the next step",
      "saveNote": "Save this for your next post"
    },
    "it": {
      "chooseImage": "Choose an image",
      "selectPrompt": "Select JPG, PNG, or WebP",
      "selectFile": "Select image file",
      "selectedPreview": "Selected preview",
      "localPreview": "Local preview",
      "inspectExport": "Inspect and export",
      "targetPreset": "Target preset",
      "fitMethod": "Fit method",
      "exportFormat": "Export format",
      "quality": "Quality",
      "resizeDownload": "Resize & download",
      "canvasNote": "Canvas processing happens only in this browser. The original image is never uploaded.",
      "selectNote": "Select a local image to see its dimensions, approximate palette, and export controls.",
      "palette": "Extracted colour palette",
      "unknown": "Unknown",
      "fitCover": "Centre crop to fill",
      "fitContain": "Fit inside canvas"
    },
    "st": {
      "yourFile": "Your subtitle file",
      "paste": "Paste SRT or VTT",
      "pasteNote": "Paste a subtitle file, then clean it, convert it, or run a transparent timing and line-length check.",
      "cleanSrt": "Clean SRT",
      "srt2vtt": "SRT → VTT",
      "vtt2srt": "VTT → SRT",
      "validate": "Validate timing",
      "checkLength": "Check line length",
      "checksReports": "Checks and reports",
      "output": "Subtitle output",
      "localOutput": "Local output",
      "noUpload": "No upload",
      "converted": "Converted text ready",
      "copy": "Copy",
      "download": "Download",
      "sample": "Sample",
      "toolNote": "This utility edits subtitle text you provide. It does not transcribe audio or generate captions.",
      "msgCueNumbers": "Added SRT cue numbers and comma timestamps.",
      "msgVtt": "Converted timestamps to VTT notation.",
      "msgDedup": "Duplicate consecutive captions removed; cue numbers normalized."
    },
    "at": {
      "selectAudio": "Select local audio",
      "selectNote": "Select an audio file to read its duration, view a simple local waveform, and export a WAV trim.",
      "selectFile": "Select audio file",
      "waveform": "Waveform",
      "trimSelection": "Trim selection",
      "preview": "Preview selection",
      "trimDownload": "Trim & download WAV",
      "start": "Start",
      "end": "End",
      "stop": "Stop",
      "adjustNote": "Adjust the start and end handles, preview, then export.",
      "wavNote": "Audio decoding and WAV export happen in the browser. The downloaded trim is WAV to keep the process reliable and lossless."
    },
    "vi": {
      "selectVideo": "Select local video",
      "selectNote": "Select a local video to see its duration, dimensions, aspect ratio, target-platform guidance, and an optional poster frame.",
      "selectFile": "Select video file",
      "selectPrompt": "Select an MP4, WebM, or MOV file",
      "resolution": "Resolution",
      "aspectRatio": "Aspect ratio",
      "duration": "Duration",
      "platformFit": "Platform fit",
      "browserOnly": "Browser-only",
      "localInspection": "Local inspection",
      "readingMeta": "Reading video metadata…",
      "posterFrame": "Poster frame",
      "extractPoster": "Extract current poster frame",
      "extracted": "Extracted poster frame",
      "downloadJpg": "Download JPG",
      "unknownType": "Unknown type",
      "metaNote": "This reads metadata and extracts a still frame locally. It does not compress or transcode your video.",
      "tipVertical": "A vertical 9:16 crop will fit better.",
      "tip16x9": "Use a 16:9 version for standard YouTube.",
      "tipShorts": "Use a 9:16 crop for Shorts.",
      "tipFitShorts": "Vertical format fits Shorts.",
      "tipFitTikTok": "Vertical format fits TikTok.",
      "tipFitYoutube": "Wide format fits standard YouTube."
    }
  },
  "components": {
    "homeSearch": {
      "searchAria": "Search AI tools",
      "search": "Search",
      "tools": "Tools",
      "trending": "Trending searches",
      "quiz": "Find Me a Tool (60s Quiz)"
    },
    "reviewSection": {
      "heading": "Community Reviews",
      "average": "Average",
      "writeReview": "Write a Review",
      "yourRating": "Your rating",
      "submitted": "Review submitted — thank you!",
      "empty": "No community reviews yet — your experience could help thousands of creators."
    },
    "scoreBreakdown": {
      "howItScored": "How it scored",
      "overallNote": "Overall is a weighted average — output quality 35%, ease of use 20%, value 20%, speed 15%, export freedom 10%.",
      "bestFor": "Best for",
      "skipIf": "Skip if"
    },
    "shareButtons": {
      "share": "Share",
      "twitter": "Twitter",
      "copied": "Copied!",
      "copyLink": "Copy link"
    },
    "verificationBadge": {
      "tellUs": "Tell us"
    },
    "benchmarkLeaderboard": {
      "heading": "Hands-On Tested Leaderboard",
      "intro": "Compare verified scores across our 10 hands-on tested AI video tools. Click any column to sort.",
      "category": "Category",
      "quality": "Quality",
      "overall": "Overall",
      "review": "Review"
    },
    "testingQueue": {
      "heading": "Editorial Lab Queue",
      "upcoming": "Upcoming Tests",
      "intro": "We test every tool on a standard 24-point benchmark brief. Schedule is tentative based on community interest.",
      "methodology": "Methodology",
      "awaiting": "Awaiting test",
      "submit": "Submit it for editorial review"
    },
    "evidenceCard": {
      "notTested": "Not Independently Tested",
      "handsOn": "Hands-On Tested",
      "protocol": "Test Protocol",
      "runId": "Run ID:",
      "dimensions": "Dimensions: Output Quality, Speed, Value, Ease of Use, Export Freedom",
      "methodology": "Full methodology"
    },
    "pricingPlans": {
      "officialSource": "Official source",
      "billing": "Billing",
      "whatYouGet": "What you get"
    },
    "priceHistory": {
      "heading": "Price history",
      "loading": "Loading recorded price points…"
    },
    "starkPoll": {
      "question": "One last question…",
      "votes": "{count} votes",
      "localTally": " · local tally (cloud DB not configured)",
      "tapToVote": " · tap to vote"
    },
    "toolRecommender": {
      "title": "Find Me a Tool",
      "subtitle": "Interactive Creator Workflow Recommender",
      "step": "Question {n} of 3",
      "taskQuestion": "What task are you trying to accomplish?",
      "budgetQuestion": "What is your monthly tool budget?",
      "priorityQuestion": "What matters most to you?",
      "back": "Back",
      "next": "Next",
      "seeResults": "See my tools",
      "restart": "Start over",
      "faceless": "🎬 Faceless YouTube Automation",
      "facelessDesc": "ElevenLabs, AutoShorts, HeyGen",
      "dubbing": "🌍 Multilingual Voice Dubbing",
      "dubbingDesc": "Voice translation across 29+ languages",
      "broll": "🎥 Cinematic B-Roll Generation",
      "brollDesc": "Runway, Sora, Luma Dream Machine",
      "podcast": "🎙️ Studio Podcast Editing",
      "podcastDesc": "Descript, Riverside, clean audio",
      "clipping": "✂️ Shorts & Clip Repurposing",
      "clippingDesc": "OpusClip, Submagic, Klap",
      "free": "$0 / Free Tiers",
      "freeDesc": "No credit card needed",
      "budget": "Under $25 / mo",
      "budgetDesc": "Starter creator plans",
      "pro": "Pro Studio ($25+)",
      "proDesc": "Unlimited exports & 4K",
      "quality": "🏆 Highest Output Quality",
      "qualityDesc": "Top benchmark scores",
      "speed": "⚡ Fastest Processing",
      "speedDesc": "Shortest wall-clock time",
      "ease": "✨ Easiest to Use",
      "easeDesc": "Beginner-friendly UI",
      "yourMatch": "Your top match",
      "alternatives": "Also worth a look",
      "why": "Why this fits",
      "startOver": "Start over"
    },
    "helpfulFeedback": {
      "question": "Was this page helpful?",
      "yes": "Yes",
      "no": "No",
      "ariaYes": "Yes, this page was helpful",
      "ariaNo": "No, this page was not helpful",
      "thanksUseful": "Thanks! Glad this was useful.",
      "thanksNot": "Thanks for the feedback — we will improve this page."
    }
  }
}

def deep_merge(target, source):
    for k, v in source.items():
        if isinstance(v, dict) and isinstance(target.get(k), dict):
            deep_merge(target[k], v)
        else:
            target[k] = v
    return target

en = json.load(open('messages/en.json'))
deep_merge(en, UI)
json.dump(en, open('messages/en.json', 'w'), ensure_ascii=False, indent=2)
open('messages/en.json', 'a').write('\n')

for loc in LOCALES[1:]:
    j = json.load(open(f'messages/{loc}.json'))
    def add_missing(target, source, path=''):
        for k, v in source.items():
            p = f'{path}.{k}' if path else k
            if isinstance(v, dict):
                if not isinstance(target.get(k), dict):
                    target[k] = {}
                add_missing(target[k], v, p)
            elif k not in target or target[k] in (None, '', []):
                target[k] = v
    add_missing(j, UI)
    json.dump(j, open(f'messages/{loc}.json', 'w'), ensure_ascii=False, indent=2)
    open(f'messages/{loc}.json', 'a').write('\n')

def count(o):
    n = 0
    for v in o.values():
        n += count(v) if isinstance(v, dict) else (len(v) if isinstance(v, list) else 1)
    return n
print('seeded studio+components keys:', count(UI))
