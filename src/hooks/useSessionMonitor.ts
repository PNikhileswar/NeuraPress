import { useSession, signOut } from 'next-auth/react';
import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
export function useSessionMonitor() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);
  const checkSessionValidity = useCallback(async () => {
    // Don't check too frequently (minimum 5 seconds between checks)
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) {
      return;
    }
    lastCheckRef.current = now;
    if (!session?.user) return;
    try {
      const response = await fetch('/api/auth/check-session-validity');
      if (response.ok) {
        const data = await response.json();
        if (!data.valid) {
          console.log('Session invalid:', data.reason);
          if (data.shouldRefresh) {
            // Session was invalidated, need to refresh or sign out
            if (data.reason === 'session_invalidated' || data.reason === 'admin_status_changed') {
              // Try to refresh the session first
              try {
                const refreshResponse = await fetch('/api/auth/refresh-session', {
                  method: 'POST',
                });
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  // Update session with new data
                  await updateSession({
                    ...session,
                    user: {
                      ...session.user,
                      isAdmin: refreshData.isAdmin
                    }
                  });
                  // Show notification and refresh page
                  alert('Your admin privileges have been updated. The page will refresh.');
                  window.location.reload();
                  return;
                }
              } catch (refreshError) {
                console.error('Failed to refresh session:', refreshError);
              }
              // If refresh failed, force sign out
              alert('Your session has been updated. Please sign in again.');
              await signOut({ callbackUrl: '/' });
              return;
            }
          }
          // For other invalid reasons, redirect to home
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error checking session validity:', error);
    }
  }, [session, updateSession, router]);
  useEffect(() => {
    if (session?.user) {
      // Start monitoring session validity every 10 seconds
      intervalRef.current = setInterval(checkSessionValidity, 10000);
      // Also check immediately
      checkSessionValidity();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session?.user, checkSessionValidity]);
  // Manual check function that can be called immediately
  const forceCheck = useCallback(() => {
    lastCheckRef.current = 0; // Reset the throttle
    checkSessionValidity();
  }, [checkSessionValidity]);
  return { forceCheck };
}