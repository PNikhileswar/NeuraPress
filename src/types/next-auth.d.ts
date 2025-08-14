import 'next-auth';
// Extending the built-in NextAuth types
declare module 'next-auth' {
  /**
   * Extends the built-in session interface
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    }
  }
  /**
   * Extends the built-in user interface
   */
  interface User {
    isAdmin?: boolean;
  }
}
// Extending the built-in JWT interface
declare module 'next-auth/jwt' {
  /** 
   * Extends the built-in JWT type 
   */
  interface JWT {
    isAdmin?: boolean;
  }
}