import React from 'react';

interface LocationPopupProps {
  location: { lat: number; lng: number };
  onClose: () => void;
}

const LocationPopup: React.FC<LocationPopupProps> = ({ location, onClose }) => {
return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
  <div className="bg-white rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-lg">
    {/* Header */}
    <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2">
      <h2 className="text-base font-semibold">Your Current Location</h2>
      <button onClick={onClose} className="text-red-400 text-lg hover:text-red-500">
        &times;
      </button>
    </div>

    {/* Map */}
    <iframe
      width="100%"
      height="300"
      className="w-full"
      frameBorder="0"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
    />
  </div>
</div>

);


};

export default LocationPopup;
