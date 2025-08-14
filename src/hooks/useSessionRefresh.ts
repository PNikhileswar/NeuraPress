import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
export function useSessionRefresh() {
  const { update: updateSession } = useSession();
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
      });
      if (response.ok) {
        const sessionData = await response.json();
        // Update the session with fresh data from database
        // This will trigger the JWT callback with the new data
        await updateSession({
          isAdmin: sessionData.isAdmin,
          name: sessionData.name,
          email: sessionData.email,
          image: sessionData.image,
          forceRefresh: true, // This triggers the database refresh in JWT callback
        });
        return { success: true, data: sessionData };
      } else {
        return { success: false, error: 'Failed to refresh session' };
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      return { success: false, error: 'Network error while refreshing session' };
    }
  }, [updateSession]);
  const forceRefreshFromDatabase = useCallback(async () => {
    try {
      // This forces a complete refresh from the database
      await updateSession({
        forceRefresh: true
      });
      return { success: true };
    } catch (error) {
      console.error('Error forcing database refresh:', error);
      return { success: false, error: 'Failed to force refresh' };
    }
  }, [updateSession]);
  return { refreshSession, forceRefreshFromDatabase };
}