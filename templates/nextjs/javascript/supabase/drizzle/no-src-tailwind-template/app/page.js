

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-8 mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-4">
            🚀 Welcome to Your Next.js + Supabase App!
          </h1>
          <p className="text-xl opacity-90">
            Your project has been successfully scaffolded with Supabase integration using Drizzle ORM and Tailwind CSS.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📋 Important Setup Instructions</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">1. Environment Variables</h3>
            <p className="text-gray-600 mb-3">
              Create a <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">.env.local</code> file in your project root:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`DATABASE_URL=your_supabase_database_url_here
# Example: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
# Get this from your Supabase project dashboard`}
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">2. Database Connection</h3>
            <p className="text-gray-600">
              The database connection is configured in <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">lib/dbConnect.js</code>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">3. Dependencies</h3>
            <p className="text-gray-600 mb-3">
              Supabase dependencies are already installed:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">drizzle-orm: ^0.44.4</code></li>
              <li><code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">postgres: ^3.4.0</code></li>
              <li><code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">drizzle-kit: ^0.20.0</code> (dev dependency)</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">4. Database Setup</h3>
            <p className="text-gray-600 mb-3">
              After setting up your environment variables, run:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`npx drizzle-kit generate
npx drizzle-kit push`}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">🎯 Next Steps</h2>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>Set up your Supabase project and get the database URL</li>
            <li>Update your Drizzle schema in <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">lib/schema.js</code></li>
            <li>Build your API routes in <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">app/api/</code></li>
            <li>Start developing your application features</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>💡 Tip:</strong> Use <code className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono">npm run dev</code> to start the development server
          </p>
        </div>
      </div>
    </main>
  );
}
