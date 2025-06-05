import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          🚀 Welcome to the Cool App
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Explore our sleek forms and interactive features. Built with Next.js, TypeScript, and Tailwind CSS.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/myform"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg text-center"
          >
            Go to MyForm
          </Link>
          <Link
            href="/shader"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg text-center"
          >
            Go to Shader
          </Link>
          <Link
            href="/stream"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg text-center"
          >
            Go to stream page
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Cool App. All rights reserved.
      </footer>
    </div>
  );
}
