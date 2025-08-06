function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-5xl font-bold text-center text-blue-600 mb-4">Welcome to Your React + Express + Shadcn Project!</h1>
      <p className="text-lg text-center text-gray-700 mb-2">
        This template uses <span className="font-semibold">MongoDB</span> as the database and <span className="font-semibold">Typegoose</span> as the ORM for backend integration.
      </p>
      <div className="bg-white rounded-lg shadow p-4 mt-4 max-w-xl mx-auto">
        <ul className="list-disc pl-6 text-left text-gray-800">
          <li>Frontend: ReactJS (Vite, Shadcn UI, Tailwind CSS, TypeScript)</li>
          <li>Backend: Express.js (TypeScript)</li>
          <li>Database: MongoDB</li>
          <li>ORM: Typegoose</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          <strong>Important:</strong> Make sure your backend server is running and MongoDB is connected.<br/>
          You can start customizing your app in <code>src/</code> and backend in <code>backend/</code>.
        </p>
      </div>
      <div className="mt-8 text-center text-gray-600">
        <span className="font-semibold">Happy coding!</span> 🚀
      </div>
    </div>
  )
}

export default App;