import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Welcome to Your Next.js App!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern, production-ready template with TypeScript, MongoDB, and Typegoose
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Tech Stack
              </CardTitle>
              <CardDescription>
                Modern technologies for scalable applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Next.js 15</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">MongoDB</Badge>
                <Badge variant="secondary">Typegoose</Badge>
                <Badge variant="secondary">Tailwind CSS</Badge>
                <Badge variant="secondary">App Router</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗄️ Database Setup
              </CardTitle>
              <CardDescription>
                MongoDB with Typegoose for type-safe models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Type-safe MongoDB models with Typegoose</p>
                <p>• Automatic schema validation</p>
                <p>• Built-in connection management</p>
                <p>• Development-ready configuration</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Start</CardTitle>
            <CardDescription>
              Get your development environment running in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">1. Environment Setup</h4>
                <p className="text-sm text-gray-600 mb-2">Create your .env.local file:</p>
                <code className="block bg-gray-800 text-white p-2 rounded text-xs">
                  MONGODB_URI=mongodb://localhost:27017/your-database-name
                </code>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">2. Start Development</h4>
                <code className="block bg-gray-800 text-white p-2 rounded text-xs">
                  npm run dev
                </code>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">3. Database Connection</h4>
                <p className="text-sm text-gray-600">
                  Database connection utilities are in <code className="bg-gray-200 px-1 rounded">lib/dbConnect.ts</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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