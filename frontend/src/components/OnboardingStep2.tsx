import React, { useState } from 'react';
import { Shirt } from 'lucide-react';

interface OnboardingStep2Props {
  onContinue: (preferredFits: string[]) => void;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ onContinue }) => {
  const [selectedFits, setSelectedFits] = useState<string[]>([]);

  const fitOptions = [
    'Oversized',
    'Fitted',
    'Loose',
    'Cropped',
    'Baggy',
    'Slim'
  ];

  const handleFitToggle = (fit: string) => {
    setSelectedFits(prev => {
      if (prev.includes(fit)) {
        return prev.filter(item => item !== fit);
      } else {
        return [...prev, fit];
      }
    });
  };

  const handleContinue = () => {
    if (selectedFits.length > 0) {
      onContinue(selectedFits);
    }
  };

  const canContinue = selectedFits.length > 0;

  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 min-h-screen text-white flex flex-col">
      {/* Header */}
      <div className="flex-1 px-6 py-8">
        {/* Logo and Progress */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 tracking-wider">CASA</h1>
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Style Preferences</h2>
          <p className="text-white/80">What fits do you love?</p>
        </div>

        {/* Preferred Fits Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Shirt size={20} className="mr-2" />
            <span className="font-medium">Preferred Fits</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fitOptions.map((fit) => (
              <button
                key={fit}
                onClick={() => handleFitToggle(fit)}
                className={`p-6 rounded-xl font-medium text-lg transition-all ${
                  selectedFits.includes(fit)
                    ? 'bg-white/20 border-2 border-white/40'
                    : 'bg-black/30 border-2 border-transparent hover:bg-black/40'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>
          {selectedFits.length > 0 && (
            <p className="text-sm text-white/60 mt-4">
              {selectedFits.length} fit{selectedFits.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            canContinue
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
