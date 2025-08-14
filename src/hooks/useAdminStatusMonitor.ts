import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
export const useAdminStatusMonitor = () => {
  const { data: session, status, update } = useSession();
  const [isChecking, setIsChecking] = useState(false);
  const checkAdminStatus = useCallback(async () => {
    if (isChecking || status !== 'authenticated' || !session?.user?.email) {
      return { success: false, message: 'Not ready to check' };
    }
    setIsChecking(true);
    try {
      // Check if session has been invalidated
      const invalidationResponse = await fetch('/api/auth/check-invalidation');
      const invalidationData = await invalidationResponse.json();
      if (invalidationData.isInvalidated) {
        console.log('Session invalidated, refreshing...', invalidationData.reason);
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
          setIsChecking(false);
          return { 
            success: true, 
            changed: true, 
            isAdmin: refreshData.user?.isAdmin,
            message: `Admin privileges ${refreshData.user?.isAdmin ? 'granted' : 'revoked'}`
          };
        }
      }
      setIsChecking(false);
      return { success: true, changed: false, message: 'No changes detected' };
    } catch (error) {
      console.error('Error monitoring admin status:', error);
      setIsChecking(false);
      return { success: false, message: 'Error checking admin status' };
    }
  }, [status, session?.user?.email, update, isChecking]);
  return {
    checkAdminStatus,
    isChecking,
    isMonitoring: false // No automatic monitoring
  };
};