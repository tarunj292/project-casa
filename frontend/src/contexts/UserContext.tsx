import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserData {
  phoneNumber?: string;
  isLoggedIn: boolean;
  isNewUser: boolean;
  onboardingData?: {
    ageRange?: string;
    styleInterests?: string[];
    preferredFits?: string[];
  };
}

interface UserContextType {
  userData: UserData;
  setUserData: (data: UserData) => void;
  updateOnboardingData: (data: Partial<UserData['onboardingData']>) => void;
  completeOnboarding: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    isLoggedIn: false,
    isNewUser: false,
    onboardingData: {}
  });

  const updateOnboardingData = (data: Partial<UserData['onboardingData']>) => {
    setUserData(prev => ({
      ...prev,
      onboardingData: {
        ...prev.onboardingData,
        ...data
      }
    }));
  };

  const completeOnboarding = () => {
    setUserData(prev => ({
      ...prev,
      isNewUser: false
    }));
  };

  return (
    <UserContext.Provider value={{
      userData,
      setUserData,
      updateOnboardingData,
      completeOnboarding
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
