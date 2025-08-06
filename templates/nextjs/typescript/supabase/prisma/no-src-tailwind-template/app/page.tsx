export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Welcome to Your Next.js + Supabase App!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern, production-ready template with TypeScript, Supabase, and Prisma
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ⚡ Tech Stack
            </h3>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Next.js 15</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">TypeScript</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Supabase</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Prisma</span>
                <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-sm">Tailwind CSS</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🗄️ Database Features
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• PostgreSQL with Supabase cloud hosting</p>
              <p>• Type-safe database queries with Prisma</p>
              <p>• Real-time subscriptions</p>
              <p>• Built-in authentication system</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">🚀 Quick Start</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">1. Environment Setup</h4>
              <p className="text-sm text-gray-600 mb-2">Create your .env.local file with Supabase credentials:</p>
              <code className="block bg-gray-800 text-white p-2 rounded text-xs">
                NEXT_PUBLIC_SUPABASE_URL=your-supabase-url<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key<br/>
                DATABASE_URL="postgresql://..."
              </code>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">2. Database Setup</h4>
              <code className="block bg-gray-800 text-white p-2 rounded text-xs">
                npx prisma migrate dev<br/>
                npx prisma generate
              </code>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">3. Start Development</h4>
              <code className="block bg-gray-800 text-white p-2 rounded text-xs">
                npm run dev
              </code>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            Ready to build something amazing? Start editing{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">app/page.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}