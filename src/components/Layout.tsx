import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative">
        <main className="p-4">
          <Outlet />
        </main>

        {!isLoginPage && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 mx-auto max-w-md">
            <div className="flex justify-around items-center h-16">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
                }
              >
                <Home size={24} strokeWidth={2.5} />
                <span className="text-[10px] font-medium mt-1">Danh sách</span>
              </NavLink>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;