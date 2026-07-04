export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Atomic AI</h1>
        <p className="text-xl text-slate-300 mb-8">Production-ready AI SaaS platform</p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="px-6 py-2 border border-slate-400 text-white rounded-lg hover:bg-slate-800 transition">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
