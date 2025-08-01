import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-8 w-full">
          <h1 className="text-4xl font-bold mb-4">
            🚀 Welcome to Your Next.js + MongoDB App!
          </h1>
          <p className="text-lg opacity-90">
            Your project has been successfully scaffolded with MongoDB integration using Mongoose and Shadcn UI.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 w-full">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📋 Important Setup Instructions
          </h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              1. Environment Variables
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Create a <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">.env.local</code> file in your project root:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
{`MONGODB_URI=your_mongodb_connection_string_here
# Example: mongodb://localhost:27017/your_database
# Or: mongodb+srv://username:password@cluster.mongodb.net/database`}
            </pre>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              2. Database Connection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              The database connection is configured in <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">lib/dbConnect.js</code>
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              3. Dependencies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              MongoDB dependencies are already installed:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4">
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">mongoose: 8.17.0</code></li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6 w-full">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            🎯 Next Steps
          </h2>
          <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 ml-4">
            <li>Set up your MongoDB database (local or cloud)</li>
            <li>Create your first model in <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded text-sm">lib/models/</code></li>
            <li>Build your API routes in <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded text-sm">app/api/</code></li>
            <li>Start developing your application features</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 w-full">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>💡 Tip:</strong> Use <code className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded text-sm">npm run dev</code> to start the development server
          </p>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
