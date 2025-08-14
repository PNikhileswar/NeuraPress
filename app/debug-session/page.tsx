'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
export default function SessionDebugPage() {
  const { data: session, status } = useSession();
  const [clientSession, setClientSession] = useState(null);
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setClientSession(data))
      .catch(err => console.error('Session fetch error:', err));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Session Debug</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">useSession() Hook</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</p>
              {session && (
                <div className="mt-4">
                  <p><strong>User ID:</strong> {(session.user as any)?.id || 'N/A'}</p>
                  <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                  <p><strong>Image URL:</strong> {session.user?.image || 'N/A'}</p>
                  <p><strong>Is Admin:</strong> {(session.user as any)?.isAdmin ? 'Yes' : 'No'}</p>
                  {session.user?.image && (
                    <div className="mt-2">
                      <p><strong>Image Preview:</strong></p>
                      <img 
                        src={session.user.image} 
                        alt="User profile" 
                        className="w-16 h-16 rounded-full mt-1"
                        onError={(e) => {
                          console.error('Image failed to load:', session.user?.image);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Direct API Call</h2>
            <div className="space-y-2">
              <p><strong>Session exists:</strong> {clientSession ? 'Yes' : 'No'}</p>
              {clientSession && (
                <div className="mt-4">
                  <p><strong>User ID:</strong> {(clientSession as any)?.user?.id || 'N/A'}</p>
                  <p><strong>Name:</strong> {(clientSession as any)?.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {(clientSession as any)?.user?.email || 'N/A'}</p>
                  <p><strong>Image URL:</strong> {(clientSession as any)?.user?.image || 'N/A'}</p>
                  <p><strong>Is Admin:</strong> {(clientSession as any)?.user?.isAdmin ? 'Yes' : 'No'}</p>
                  {(clientSession as any)?.user?.image && (
                    <div className="mt-2">
                      <p><strong>Image Preview:</strong></p>
                      <img 
                        src={(clientSession as any).user.image} 
                        alt="User profile" 
                        className="w-16 h-16 rounded-full mt-1"
                        onError={(e) => {
                          console.error('Image failed to load:', (clientSession as any)?.user?.image);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(clientSession, null, 2)}
            </pre>
          </div>
        </div>
        <div className="mt-8 text-center">
          <a
            href="/api/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Go to NextAuth Sign In
          </a>
          <a
            href="/login"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mr-4"
          >
            Go to Custom Login
          </a>
          <a
            href="/api/auth/signout"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}