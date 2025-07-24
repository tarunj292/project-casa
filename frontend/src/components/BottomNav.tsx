import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid3X3, TrendingUp, ShoppingBag, Heart } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/collection', icon: Grid3X3, label: 'Collection' },
    { path: '/swipe', icon: Heart, label: 'Swipe' },
    { path: '/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/bag', icon: ShoppingBag, label: 'Bag' },
  ];

  return (
    <div className="bottom-nav fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `btn flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-400 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;