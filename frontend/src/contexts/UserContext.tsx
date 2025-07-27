import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

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
  completeOnboarding: () => Promise<void>;
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

  const completeOnboarding = async () => {
    try {
      // Prepare user data for backend
      const userDataForBackend = {
        phone_number: userData.phoneNumber,
        email: `${userData.phoneNumber?.replace(/[^0-9]/g, '')}@temp.casa`, // temporary email
        display_name: `User_${userData.phoneNumber?.slice(-4)}`,
        interests: userData.onboardingData?.styleInterests || [],
        ml_preferences: userData.onboardingData?.preferredFits || [],
        age: userData.onboardingData?.ageRange === 'Gen Z' ? 22 :
             userData.onboardingData?.ageRange === 'Millennial' ? 30 : 25,
        last_login: new Date()
      };

      // Send data to backend
      const response = await axios.post('http://localhost:5002/api/users', userDataForBackend);
      console.log('User registered successfully:', response.data);

      // Update local state
      setUserData(prev => ({
        ...prev,
        isNewUser: false
      }));
    } catch (error) {
      console.error('Error registering user:', error);
      // Still update local state even if backend fails
      setUserData(prev => ({
        ...prev,
        isNewUser: false
      }));
    }
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
