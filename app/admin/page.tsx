import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  // Check if user is logged in and has admin privileges
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage articles and generate AI-powered content</p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}