import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Family, Profile } from '@/types/models';

type AppContextValue = {
  session: Session | null;
  profile: Profile | null;
  family: Family | null;
  members: Profile[];
  isLoading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileAndFamily = useCallback(async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) throw profileError;
    setProfile(profileData ?? null);

    if (profileData?.family_id) {
      const [{ data: familyData }, { data: membersData }] = await Promise.all([
        supabase.from('families').select('*').eq('id', profileData.family_id).maybeSingle(),
        supabase
          .from('profiles')
          .select('*')
          .eq('family_id', profileData.family_id)
          .order('created_at', { ascending: true }),
      ]);
      setFamily(familyData ?? null);
      setMembers(membersData ?? []);
    } else {
      setFamily(null);
      setMembers([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (data.session?.user) {
      await loadProfileAndFamily(data.session.user.id);
    } else {
      setProfile(null);
      setFamily(null);
      setMembers([]);
    }
  }, [loadProfileAndFamily]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        try {
          await loadProfileAndFamily(data.session.user.id);
        } catch {
          // profile might not exist yet (race with trigger) — ignore, will retry on refresh
        }
      }
      if (mounted) setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        try {
          await loadProfileAndFamily(nextSession.user.id);
        } catch {
          // ignore
        }
      } else {
        setProfile(null);
        setFamily(null);
        setMembers([]);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfileAndFamily]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      profile,
      family,
      members,
      isLoading,
      isAdmin: profile?.role === 'admin',
      refresh,
      signOut,
    }),
    [session, profile, family, members, isLoading, refresh, signOut]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
