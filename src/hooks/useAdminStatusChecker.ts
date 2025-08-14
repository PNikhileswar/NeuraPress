import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
// Simplified admin status checker without automatic monitoring
export const useAdminStatusChecker = () => {
  const { update } = useSession();
  const checkAndUpdateAdminStatus = useCallback(async () => {
    try {
      // Check if session has been invalidated
      const invalidationResponse = await fetch('/api/auth/check-invalidation');
      const invalidationData = await invalidationResponse.json();
      if (invalidationData.isInvalidated) {
        // Force refresh session from database
        const refreshResponse = await fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceRefresh: true })
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          // Update the session with new data
          await update({
            forceRefresh: true,
            isAdmin: refreshData.user?.isAdmin
          });
          return { 
            success: true, 
            changed: true, 
            isAdmin: refreshData.user?.isAdmin 
          };
        }
      }
      return { success: true, changed: false };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { success: false, error: String(error) };
    }
  }, [update]);
  return { checkAndUpdateAdminStatus };
};