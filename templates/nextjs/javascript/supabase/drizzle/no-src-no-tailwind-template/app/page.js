export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #3ecf8e 0%, #2d7d32 100%)', 
        color: 'white', 
        padding: '2rem', 
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem' }}>
          🚀 Welcome to Your Next.js + Supabase App!
        </h1>
        <p style={{ fontSize: '1.1rem', margin: '0', opacity: '0.9' }}>
          Your project has been successfully scaffolded with Supabase integration using Drizzle ORM.
        </p>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#495057', margin: '0 0 1rem 0' }}>📋 Important Setup Instructions</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>1. Environment Variables</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Create a <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>.env.local</code> file in your project root:
          </p>
          <pre style={{ 
            background: '#212529', 
            color: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
{`DATABASE_URL=your_supabase_database_url_here
# Example: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
# Get this from your Supabase project dashboard`}
          </pre>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>2. Database Connection</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            The database connection is configured in <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>lib/dbConnect.js</code>
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>3. Dependencies</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Supabase dependencies are already installed:
          </p>
          <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
            <li><code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>drizzle-orm: ^0.30.0</code></li>
            <li><code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>postgres: ^3.4.0</code></li>
            <li><code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>drizzle-kit: ^0.20.0</code> (dev dependency)</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>4. Database Setup</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            After setting up your environment variables, run:
          </p>
          <pre style={{ 
            background: '#212529', 
            color: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
{`npx drizzle-kit generate
npx drizzle-kit push`}
          </pre>
        </div>
      </div>

      <div style={{ 
        background: '#d1ecf1', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #bee5eb'
      }}>
        <h2 style={{ color: '#0c5460', margin: '0 0 1rem 0' }}>🎯 Next Steps</h2>
        <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
          <li>Set up your Supabase project and get the database URL</li>
          <li>Update your Drizzle schema in <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>lib/schema.js</code></li>
          <li>Build your API routes in <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>app/api/</code></li>
          <li>Start developing your application features</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#fff3cd', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <p style={{ margin: '0', color: '#856404' }}>
          <strong>💡 Tip:</strong> Use <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>npm run dev</code> to start the development server
        </p>
      </div>
    </main>
  );
}