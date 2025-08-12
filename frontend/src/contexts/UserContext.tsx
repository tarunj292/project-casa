import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import axios from 'axios';

export interface UserData {
  _id: string;
  role: number;
  phoneNumber?: string;
  name?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  isLoggedIn: boolean;
  isNewUser: boolean;
  onboardingData?: {
    ageRange?: string;
    styleInterests?: string[];
    preferredFits?: string[];
  };
}

interface SaveState {
  isSaving: boolean;
  error: string | null;
  lastSavedAt: string | null; // ISO
}

interface UserContextType {
  userData: UserData;
  // MERGE-style update (safe)
  updateUser: (patch: Partial<UserData>) => void;
  // Hard set (use sparingly)
  setUserData: (data: UserData) => void;

  login: (payload: Partial<UserData>) => void;
  logout: () => void;

  updateOnboardingData: (data: Partial<UserData['onboardingData']>) => void;
  completeOnboarding: () => Promise<void>;

  saveState: SaveState;
  resetSaveState: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'casa_user_data';
const STORAGE_VERSION = 1;

type StoredShape = {
  __v: number;
  data: UserData;
};

const DEFAULT_USER: UserData = {
  _id: '',
  role: -1,
  isLoggedIn: false,
  isNewUser: false,
  onboardingData: {}
};

// -- helpers
const readStorage = (): UserData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;

    const parsed: StoredShape | UserData = JSON.parse(raw);

    // migrate old shape
    if ((parsed as any).__v === undefined && typeof (parsed as any).isLoggedIn !== 'undefined') {
      return parsed as UserData;
    }

    if ((parsed as any).__v === STORAGE_VERSION && (parsed as any).data) {
      return (parsed as StoredShape).data;
    }
  } catch (e) {
    console.warn('UserContext: failed to parse storage, ignoring.', e);
  }
  return DEFAULT_USER;
};

const writeStorage = (data: UserData) => {
  try {
    const wrapped: StoredShape = { __v: STORAGE_VERSION, data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapped));
  } catch (e) {
    console.warn('UserContext: failed to write storage.', e);
  }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start as "not hydrated" to avoid saving defaults over real data
  const [userData, _setUserData] = useState<UserData>(DEFAULT_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    error: null,
    lastSavedAt: null,
  });

  const initialLoadRef = useRef(true);

  // Hydrate once on mount
  useEffect(() => {
    const stored = readStorage();
    _setUserData(stored);
    setIsHydrated(true);
    initialLoadRef.current = false;
  }, []);

  // Save to storage whenever userData changes *after* hydration
  useEffect(() => {
    if (!isHydrated) return;
    writeStorage(userData);
  }, [userData, isHydrated]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: StoredShape = JSON.parse(e.newValue);
          if (parsed && parsed.data) {
            _setUserData(parsed.data);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ---- exposed helpers

  // MERGE-style update (safe)
  const updateUser = (patch: Partial<UserData>) => {
    _setUserData(prev => ({
      ...prev,
      ...patch,
      onboardingData: {
        ...prev.onboardingData,
        ...patch.onboardingData,
      },
    }));
  };

  // Hard set (use sparingly)
  const setUserData = (data: UserData) => {
    _setUserData(data);
  };

  const resetSaveState = () => {
    setSaveState({ isSaving: false, error: null, lastSavedAt: null });
  };

  const updateOnboardingData = (data: Partial<UserData['onboardingData']>) => {
    updateUser({ onboardingData: { ...userData.onboardingData, ...data } });
  };

  // Simple login that preserves existing fields and marks logged in
  const login = (payload: Partial<UserData>) => {
    updateUser({
      ...payload,
      isLoggedIn: true,
      isNewUser: false,
    });
  };

  const logout = () => {
    _setUserData(DEFAULT_USER);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    resetSaveState();
  };

  const completeOnboarding = async () => {
    setSaveState({ isSaving: true, error: null, lastSavedAt: null });
    try {
      const userDataForBackend = {
        phone: userData.phoneNumber,
        email:
          userData.email ||
          `${userData.phoneNumber?.replace(/[^0-9]/g, '')}@temp.casa`,
        display_name:
          userData.name || `User_${userData.phoneNumber?.slice(-4)}`,
        interests: userData.onboardingData?.styleInterests || [],
        ml_preferences: userData.onboardingData?.preferredFits || [],
        age: userData.onboardingData?.ageRange?.includes('Gen Z')
          ? 22
          : userData.onboardingData?.ageRange?.includes('Millennial')
          ? 30
          : 25,
        last_login: new Date(),
      };

      const res = await axios.post('http://localhost:5002/api/users', userDataForBackend);

      _setUserData(prev => ({
        ...prev,
        isNewUser: false,
        isLoggedIn: true,
        _id: res.data._id,
        role: res.data.role,
      }));

      setSaveState({
        isSaving: false,
        error: null,
        lastSavedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('❌ Error registering user:', error);

      // If duplicate user, still mark as logged-in locally
      if (error?.response?.status === 400 && error.response.data?.error?.includes('duplicate')) {
        _setUserData(prev => ({
          ...prev,
          isNewUser: false,
          isLoggedIn: true,
          _id: prev._id || '',
          role: prev.role ?? 0,
        }));
        setSaveState({
          isSaving: false,
          error: null,
          lastSavedAt: new Date().toISOString(),
        });
        return;
      }

      setSaveState({
        isSaving: false,
        error: error?.message || 'Failed to save',
        lastSavedAt: null,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        updateUser,
        setUserData,
        login,
        logout,
        updateOnboardingData,
        completeOnboarding,
        saveState,
        resetSaveState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};
