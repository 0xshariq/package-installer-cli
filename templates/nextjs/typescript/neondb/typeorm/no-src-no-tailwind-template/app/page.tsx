export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
        color: 'white', 
        padding: '2rem', 
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem' }}>
          🚀 Next.js + NeonDB + TypeORM
        </h1>
        <p style={{ fontSize: '1.1rem', margin: '0', opacity: '0.9' }}>
          Modern full-stack application with Next.js, NeonDB PostgreSQL, and TypeORM
        </p>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#495057', margin: '0 0 1rem 0' }}>🛠️ Technology Stack</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#0070f3', margin: '0 0 0.5rem 0' }}>Frontend</h3>
            <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
              <li>Next.js 14 with TypeScript</li>
              <li>React 18</li>
              <li>App Router</li>
              <li>CSS Modules</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#22c55e', margin: '0 0 0.5rem 0' }}>Backend & Database</h3>
            <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
              <li>NeonDB (PostgreSQL)</li>
              <li>TypeORM</li>
              <li>API Routes</li>
              <li>Server Actions</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#e3f2fd', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #bbdefb'
      }}>
        <h2 style={{ color: '#1976d2', margin: '0 0 1rem 0' }}>📋 Setup Instructions</h2>
        <ol style={{ margin: '0', paddingLeft: '1.5rem' }}>
          <li>Create a <code>.env.local</code> file and add your NeonDB connection details</li>
          <li>Run <code>npm run db:migrate</code> to set up your database schema</li>
          <li>Start the development server with <code>npm run dev</code></li>
          <li>Begin building your amazing application! 🎉</li>
        </ol>
      </div>
    </main>
  );
}