import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              NoteBank
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;