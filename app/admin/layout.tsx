import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Admin - Article Generation | NeuraPress',
  description: 'Admin dashboard for managing article generation',
  robots: 'noindex, nofollow',
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}