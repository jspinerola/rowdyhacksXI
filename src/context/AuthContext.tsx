import React, { createContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  username?: string;
}

interface AuthContextProps {
  user: any;
  session: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // refreshUserProfile: () => Promise<void>; ???
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  console.log("AuthProvider profile:", profile);

  // fetch user profile
  const fetchProfile = async (userId: string) => {
    console.log("Fetching profile for userId:", userId);
    if (!userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      return null;
    } else {
      console.log("Fetched profile:", data);
      setProfile(data ?? null);
      return data ?? null;
    }
  };

  // signIn, signUp, signOut declared at component scope so they are available to the provider value
  const signIn = async (email: string, password: string) => {
    // Let onAuthStateChange update session/user/profile.
    setLoading(true);
    try {
      await supabase.auth.signInWithPassword({ email, password });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("Error signing up:", error);
        throw error;
      }

      // insert into profiles table with values
      if (data?.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, username: email.split("@")[0] }]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        } else {
          await fetchProfile(data.user.id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      setProfile(null);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);

    // Seed from cached session (prevents "signed out" right after redirect)
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        const s = data.session ?? null;
        setSession(s);
        setUser(s?.user ?? null);
      })
      .finally(() => alive && setLoading(false));

    // Subscribe to future changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!alive) return;
        setSession(s);
        setUser(s?.user ?? null);
      }
    );

    return () => {
      alive = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setProfile(null);
      return;
    }
    (async () => {
      console.log("AuthContext: user changed → fetching profile");
      await fetchProfile(user.id);
      if (!cancelled) {
        // no-op; fetchProfile already set state
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
