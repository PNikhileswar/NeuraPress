'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useCallback, useRef } from 'react';
export const SessionSynchronizer = () => {
  const { data: session, status, update } = useSession();
  const hasRunRef = useRef<boolean>(false);
  const syncUserData = useCallback(async () => {
    if (status === 'authenticated' && session?.user?.email) {
      try {        
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email })
        });
        if (response.ok) {
          const userData = await response.json();
          // Check if admin status has changed
          const currentIsAdmin = (session.user as any)?.isAdmin || false;
          const newIsAdmin = userData.user?.isAdmin || false;
          if (currentIsAdmin !== newIsAdmin) {            
            // Update the session with fresh data
            await update({
              forceRefresh: true,
              isAdmin: newIsAdmin,
              name: userData.user.name,
              image: userData.user.image
            });
          }
        }
      } catch (error) {
        // Silent handling for sync errors
      }
    }
  }, [session?.user?.email, status, update]);
  // Only sync ONCE when the component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && !hasRunRef.current) {
      hasRunRef.current = true;
      syncUserData();
    }
  }, [status, syncUserData]);
  return null; // This component doesn't render anything
};