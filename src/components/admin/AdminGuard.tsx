'use client';
import { useSession } from 'next-auth/react';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const { forceCheck } = useSessionMonitor();
  const router = useRouter();
  useEffect(() => {
    // Force a session validity check when component mounts
    if (session?.user) {
      forceCheck();
    }
  }, [session?.user, forceCheck]);
  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  // Not authenticated
  if (!session) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  // Not admin
  if (!(session.user as any)?.isAdmin) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}