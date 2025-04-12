// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { Home } from 'lucide-react';
// import type { SidebarProps, NavItem } from './types';

// /**
//  * Main sidebar navigation component
//  */
// const Sidebar: React.FC<SidebarProps> = ({ additionalNavItems = [] }) => {
//   const defaultNavItems: NavItem[] = [
//     { path: '/', label: 'Home', icon: Home },
//   ];

//   const navItems = [...defaultNavItems, ...additionalNavItems];

//   return (
//     <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
//       <nav className="mt-5 px-2">
//         <div className="space-y-1">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={({ isActive }) =>
//                 `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
//                   isActive
//                     ? 'bg-gray-100 text-gray-900'
//                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                 }`
//               }
//             >
//               <item.icon className="mr-3 h-5 w-5" />
//               {item.label}
//             </NavLink>
//           ))}
//         </div>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar; 


// src/components/layout/Sidebar/index.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import type { SidebarProps, NavItem } from './types';

/**
 * Main sidebar navigation component
 */
function Sidebar({ additionalNavItems = [] }: SidebarProps) {
  const defaultNavItems: NavItem[] = [
    { path: '/', label: 'Home', icon: Home },
  ];
  
  const navItems = [...defaultNavItems, ...additionalNavItems];
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;