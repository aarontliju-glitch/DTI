import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Doctor } from '../types/database';
import { db } from '../lib/databaseService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: Profile | null;
  userRole: UserRole | null;
  doctorProfile: Doctor | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (data: { full_name: string; email: string; phone?: string; role: UserRole; password?: string }) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;
  refreshDoctorProfile: () => void;
  isLiveSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'doctor_booker_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId) {
        const found = db.getProfileById(savedUserId);
        if (found) {
          setCurrentUser(found);
          if (found.role === 'doctor') {
            const doc = db.getDoctorById(found.id);
            setDoctorProfile(doc || null);
          }
        }
      } else {
        // Default to demo patient (Rahul Verma)
        const defaultPatient = db.getProfileById('c0000000-0000-0000-0000-000000000001');
        if (defaultPatient) {
          setCurrentUser(defaultPatient);
          localStorage.setItem(CURRENT_USER_KEY, defaultPatient.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDoctorProfile = () => {
    if (currentUser?.role === 'doctor') {
      const doc = db.getDoctorById(currentUser.id);
      setDoctorProfile(doc || null);
    }
  };

  const login = async (email: string, roleHint?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Find matching user profile
      const profiles = db.getProfiles();
      let match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

      if (!match && roleHint) {
        match = profiles.find(p => p.role === roleHint);
      }

      if (!match) {
        // Create quick account if non-existent
        match = db.createProfile({
          id: crypto.randomUUID(),
          full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email,
          role: roleHint || 'patient',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      setCurrentUser(match);
      localStorage.setItem(CURRENT_USER_KEY, match.id);

      if (match.role === 'doctor') {
        const doc = db.getDoctorById(match.id);
        setDoctorProfile(doc || null);
      } else {
        setDoctorProfile(null);
      }

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { full_name: string; email: string; phone?: string; role: UserRole; password?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUserId = crypto.randomUUID();
      const newProfile = db.createProfile({
        id: newUserId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // If registered as doctor, create doctor shell awaiting admin verification
      if (data.role === 'doctor') {
        const newDoc: Doctor = {
          id: crypto.randomUUID(),
          user_id: newUserId,
          specialization: 'General Medicine',
          qualifications: 'MBBS',
          experience_years: 1,
          consultation_fee: 500,
          biography: 'Newly registered medical practitioner.',
          license_number: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db['doctors'].push(newDoc);
        db['save']('doctors', db['doctors']);
        setDoctorProfile(newDoc);
      }

      setCurrentUser(newProfile);
      localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setDoctorProfile(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // Quick Switcher for convenient testing of all 3 distinct user roles
  const switchDemoRole = (role: UserRole) => {
    let targetProfile: Profile | undefined;
    if (role === 'patient') {
      targetProfile = db.getProfileById('c0000000-0000-0000-0000-000000000001');
    } else if (role === 'doctor') {
      targetProfile = db.getProfileById('d0000000-0000-0000-0000-000000000001');
    } else if (role === 'admin') {
      targetProfile = db.getProfileById('a0000000-0000-0000-0000-000000000001');
    }

    if (targetProfile) {
      setCurrentUser(targetProfile);
      localStorage.setItem(CURRENT_USER_KEY, targetProfile.id);
      if (role === 'doctor') {
        const doc = db.getDoctorById(targetProfile.id);
        setDoctorProfile(doc || null);
      } else {
        setDoctorProfile(null);
      }
    }
  };

  const updateCurrentUserProfile = (updates: Partial<Profile>) => {
    if (!currentUser) return;
    const updated = db.updateProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || null,
        doctorProfile,
        isLoading,
        login,
        signup,
        logout,
        switchDemoRole,
        updateCurrentUserProfile,
        refreshDoctorProfile,
        isLiveSupabase: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
