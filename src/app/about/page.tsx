export const metadata = { title: 'About — CreatorAI Hub', description: 'About CreatorAI Hub' };
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">About CreatorAI Hub</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          CreatorAI Hub is the curated AI toolbox for video creators. We hand-pick, test, and compare the best AI tools for YouTube, TikTok, and professional video production.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Our mission is simple: stop searching, start creating.
        </p>
      </div>
    </div>
  );
}
