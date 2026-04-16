import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: { approved: boolean; display_name: string | null; email: string } | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("Auth timeout — forcing isLoading=false");
      setAuthReady(true);
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("getSession error:", error);
        }

        setUser(session?.user ?? null);
      })
      .finally(() => {
        setAuthReady(true);
      });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setProfileLoading(false);
      return;
    }

    let isActive = true;

    const fetchProfile = async () => {
      setProfileLoading(true);

      try {
        const [profileRes, roleRes] = await Promise.all([
          supabase.from("profiles").select("approved, display_name, email").eq("user_id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (roleRes.error) throw roleRes.error;

        if (!isActive) return;

        setProfile(profileRes.data ?? null);
        setIsAdmin(Boolean(roleRes.data));
      } catch (err) {
        console.error("fetchProfile error:", err);

        if (!isActive) return;

        setProfile(null);
        setIsAdmin(false);
      } finally {
        if (isActive) {
          setProfileLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isActive = false;
    };
  }, [authReady, user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setProfileLoading(false);
    setAuthReady(true);
  };

  const isLoading = !authReady || profileLoading;

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
