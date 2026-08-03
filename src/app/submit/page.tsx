export const metadata = { title: 'Submit Tool — CreatorAI Hub', description: 'Submit your AI tool' };
export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold mb-6">Submit Your Tool</h1>
        <form className="space-y-4">
          <input type="text" placeholder="Tool Name" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none" />
          <input type="url" placeholder="Tool URL" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none" />
          <textarea placeholder="Description" rows={4} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none" />
          <button type="submit" className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500">Submit for Review</button>
        </form>
      </div>
    </div>
  );
}
