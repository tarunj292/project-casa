import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import OnboardingStep1 from '../components/OnboardingStep1';
import OnboardingStep2 from '../components/OnboardingStep2';

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { userData, updateOnboardingData, completeOnboarding } = useUser();
  const navigate = useNavigate();

  const handleStep1Continue = (ageRange: string, styleInterests: string[]) => {
    updateOnboardingData({
      ageRange,
      styleInterests
    });
    setCurrentStep(2);
  };

  const handleStep2Continue = async (preferredFits: string[]) => {
    updateOnboardingData({
      preferredFits
    });
    await completeOnboarding();
    // Navigate to home page after completing onboarding
    navigate('/');
  };

  console.log('User data in onboarding:', userData);
  
  return (
    <div>
      {currentStep === 1 && (
        <OnboardingStep1 onContinue={handleStep1Continue} />
      )}
      {currentStep === 2 && (
        <OnboardingStep2 onContinue={handleStep2Continue} />
      )}
    </div>
  );
};

export default OnboardingPage;
