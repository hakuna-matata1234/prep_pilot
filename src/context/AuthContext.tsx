import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  fetchProfileFromSupabase,
  updateProfileInSupabase
} from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSupabase: boolean;
  login: (email: string, role?: UserRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, role: UserRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const DEFAULT_STUDENT: UserProfile = {
  id: 'usr_student_01',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  targetStream: 'cse',
  targetExamRole: 'Software Engineer (SDE I/II)',
  experienceLevel: 'fresher',
  preferredLanguage: 'en',
  dailyPracticeGoal: 20,
  dailyStreak: 6,
  xp: 1450,
  level: 4,
  completedSessions: 8,
  totalSpeakingMinutes: 74,
  badges: ['Speed Talker', 'DSA Guru', 'Gaze Master', '7-Day Streak'],
  isOnboarded: true,
};

const DEFAULT_MENTOR: UserProfile = {
  id: 'usr_mentor_01',
  name: 'Col. Rajesh Verma (Retd.)',
  email: 'rajesh.verma@ssbmentor.in',
  role: 'mentor',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  targetStream: 'upsc_nda',
  targetExamRole: 'SSB Board Interviewer',
  experienceLevel: '3+yrs',
  preferredLanguage: 'en',
  dailyStreak: 18,
  xp: 4900,
  level: 9,
  completedSessions: 52,
  totalSpeakingMinutes: 480,
  badges: ['Master Mentor', 'Armed Forces Verifier', 'Top Rated'],
  isOnboarded: true,
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin_01',
  name: 'Devraj Kapoor (Lead Admin)',
  email: 'admin@preppilot.ai',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  dailyStreak: 30,
  xp: 8500,
  level: 15,
  completedSessions: 120,
  totalSpeakingMinutes: 980,
  badges: ['Platform Founder', 'Proctor Supervisor', 'Integrity Officer'],
  isOnboarded: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabase = isSupabaseConfigured();

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('prep_pilot_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STUDENT;
      }
    }
    return DEFAULT_STUDENT; // Instant friction-free demo access
  });

  const [language, setLanguageState] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('prep_pilot_lang') as 'en' | 'hi') || 'en';
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('prep_pilot_theme') as 'dark' | 'light') || 'dark';
  });

  // Listen to live Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabase) return;

    // Check existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabase]);

  const syncSupabaseUser = async (sbUser: any) => {
    const profile = await fetchProfileFromSupabase(sbUser.id);
    if (profile) {
      setUser(profile);
    } else {
      const fallback: UserProfile = {
        id: sbUser.id,
        name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Candidate',
        email: sbUser.email || '',
        role: sbUser.user_metadata?.role || 'student',
        avatar: sbUser.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        targetStream: sbUser.user_metadata?.target_stream || 'cse',
        targetExamRole: 'Software Engineer (SDE I/II)',
        dailyStreak: 1,
        xp: 150,
        level: 1,
        completedSessions: 0,
        totalSpeakingMinutes: 0,
        badges: ['Early Bird'],
        isOnboarded: true
      };
      setUser(fallback);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('prep_pilot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('prep_pilot_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('prep_pilot_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('prep_pilot_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const login = async (email: string, role: UserRole = 'student', password?: string): Promise<{ success: boolean; error?: string }> => {
    // If Supabase is configured and password is provided, perform real Supabase Auth
    if (isSupabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If demo credential or user not found, fallback smoothly to demo role
          console.warn('Supabase auth failed, using demo fallback:', error.message);
        } else if (data.user) {
          await syncSupabaseUser(data.user);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signIn exception:', err.message);
      }
    }

    // Demo role switch fallback
    let nextUser: UserProfile;
    if (role === 'admin' || email.includes('admin')) {
      nextUser = { ...DEFAULT_ADMIN, email };
    } else if (role === 'mentor' || email.includes('mentor')) {
      nextUser = { ...DEFAULT_MENTOR, email };
    } else {
      nextUser = { ...DEFAULT_STUDENT, email };
    }
    setUser(nextUser);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    role: UserRole,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              target_stream: 'cse'
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await syncSupabaseUser(data.user);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local registration fallback
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role,
      dailyStreak: 1,
      xp: 100,
      level: 1,
      completedSessions: 0,
      totalSpeakingMinutes: 0,
      badges: ['Early Bird'],
      isOnboarded: false,
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
    if (isSupabase && user?.id) {
      await updateProfileInSupabase(user.id, updated);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    if (role === 'student') setUser(DEFAULT_STUDENT);
    else if (role === 'mentor') setUser(DEFAULT_MENTOR);
    else if (role === 'admin') setUser(DEFAULT_ADMIN);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSupabase,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
        language,
        setLanguage,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
