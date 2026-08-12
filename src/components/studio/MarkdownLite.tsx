import React from 'react';

/**
 * MarkdownLite — a tiny, XSS-safe renderer for AI Studio output.
 *
 * 2026-08-12 audit: the AI responses (Gemini/Groq/OpenRouter) come back as
 * Markdown and were injected as raw text with font-mono, so users literally
 * saw `### ⚡ …`, `**bold**` and backticks. Rendering must NOT use
 * dangerouslySetInnerHTML with unsanitized model output, so this builds a
 * React tree from plain text instead — nothing injected can ever become a
 * tag or an attribute.
 *
 * Supported subset (all the providers actually emit):
 *   ### / ## / # headings, **bold**, `inline code`, ``` fenced blocks,
 *   "- "/"* " bullets, "1." numbered items, --- rules, and line breaks.
 */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Split first on code spans, then bold inside the remaining prose.
  const nodes: React.ReactNode[] = [];
  const codeParts = text.split(/`([^`]+)`/g);
  codeParts.forEach((part, i) => {
    if (i % 2 === 1) {
      nodes.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="mx-0.5 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[0.92em] font-semibold text-cyan-200"
        >
          {part}
        </code>
      );
      return;
    }
    const boldParts = part.split(/\*\*([^*]+)\*\*/g);
    boldParts.forEach((seg, j) => {
      if (j % 2 === 1) {
        nodes.push(
          <strong key={`${keyPrefix}-b${i}-${j}`} className="font-bold text-white">
            {seg}
          </strong>
        );
      } else if (seg) {
        nodes.push(<React.Fragment key={`${keyPrefix}-t${i}-${j}`}>{seg}</React.Fragment>);
      }
    });
  });
  return nodes;
}

export function MarkdownLite({ text, className = '' }: { text: string; className?: string }) {
  const lines = String(text ?? '').split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;
  let codeBuffer: string[] | null = null;

  const flushList = (suffix: string) => {
    if (!listBuffer) return;
    const { ordered, items } = listBuffer;
    const children = items.map((item, idx) => (
      <li key={idx} className="leading-relaxed">
        {renderInline(item, `li${suffix}-${idx}`)}
      </li>
    ));
    blocks.push(
      ordered ? (
        <ol key={`ol-${suffix}`} className="my-3 list-decimal space-y-1.5 ps-5 marker:font-bold marker:text-accent-400">
          {children}
        </ol>
      ) : (
        <ul key={`ul-${suffix}`} className="my-3 list-disc space-y-1.5 ps-5 marker:text-accent-400">
          {children}
        </ul>
      )
    );
    listBuffer = null;
  };

  // for..of (not forEach): TS can't track assignments made inside
  // callbacks, which falsely narrows the buffers to null after the loop.
  for (const [idx, rawLine] of lines.entries()) {
    const line = rawLine.trimEnd();
    const fence = /^```/.test(line.trim());

    if (fence) {
      if (codeBuffer === null) {
        flushList(`fl-${idx}`);
        codeBuffer = [];
      } else {
        blocks.push(
          <pre
            key={`pre-${idx}`}
            className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-relaxed text-zinc-200"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = null;
      }
      continue;
    }
    if (codeBuffer !== null) {
      codeBuffer.push(rawLine);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`gap-${idx}`);
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushList(`h-${idx}`);
      const level = heading[1].length;
      const body = renderInline(heading[2], `h${idx}`);
      const cls =
        level <= 2
          ? 'mb-2 mt-4 text-sm font-black text-white first:mt-0 sm:text-base'
          : 'mb-2 mt-4 text-xs font-black uppercase tracking-wider text-accent-300 first:mt-0';
      blocks.push(
        <h3 key={`h-${idx}`} className={cls}>
          {body}
        </h3>
      );
      continue;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      flushList(`hr-${idx}`);
      blocks.push(<hr key={`hr-${idx}`} className="my-4 border-white/10" />);
      continue;
    }

    const bullet = /^[-*•]\s+(.*)$/.exec(trimmed);
    const numbered = /^(\d+)[.)]\s+(.*)$/.exec(trimmed);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const item = (bullet ? bullet[1] : numbered![2]) ?? '';
      if (listBuffer && listBuffer.ordered === ordered) {
        listBuffer.items.push(item);
      } else {
        flushList(`sw-${idx}`);
        listBuffer = { ordered, items: [item] };
      }
      continue;
    }

    flushList(`p-${idx}`);
    blocks.push(
      <p key={`p-${idx}`} className="my-2 leading-relaxed">
        {renderInline(trimmed, `p${idx}`)}
      </p>
    );
  }

  flushList('end');
  if (codeBuffer !== null) {
    blocks.push(
      <pre key="pre-end" className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-relaxed text-zinc-200">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return <div className={`text-xs text-zinc-200 sm:text-sm ${className}`}>{blocks}</div>;
}
