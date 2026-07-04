export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Atomic AI
        </h1>
        <p className="mb-8 text-xl text-gray-400">Production-ready AI SaaS platform</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-lg border-2 border-blue-600 px-6 py-3 font-medium text-blue-400 hover:bg-blue-950 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
