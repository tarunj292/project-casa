import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import LocationPopup from './LocationPopup';

const NavShell: React.FC = () => {
  const location = useLocation();
  const hideTopBarRoutes = ['/collection', '/trends', '/bag'];
  const hideTopBar = hideTopBarRoutes.includes(location.pathname);

  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 relative">
      {!hideTopBar && (
        <TopBar
          setShowLocationPopup={setShowLocationPopup}
          setUserLocation={setUserLocation}
        />
      )}

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <BottomNav />

      {showLocationPopup && userLocation && (
        <LocationPopup
          location={userLocation}
          onClose={() => setShowLocationPopup(false)}
        />
      )}
    </div>
  );
};

export default NavShell;
