function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          ReactJS Express Shadcn Template
        </h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology Stack</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-blue-600">Frontend</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• React 18 with TypeScript</li>
                <li>• Vite (Build Tool)</li>
                <li>• Shadcn/UI Components</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-green-600">Backend</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Express.js with TypeScript</li>
                <li>• NeonDB (PostgreSQL)</li>
                <li>• TypeORM</li>
                <li>• RESTful API</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              🚀 Full-stack TypeScript template with NeonDB PostgreSQL and TypeORM
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 text-lg">
          Ready to build your next amazing project? Start coding! 💻
        </p>
      </div>
    </div>
  )
}

export default App;