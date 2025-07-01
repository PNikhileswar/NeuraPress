import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Simple admin check - in production, you'd have proper role-based access
  if (!session?.user?.email) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage articles and generate content from trending topics</p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  );
}
