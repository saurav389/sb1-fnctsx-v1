import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Briefcase, CheckSquare, DollarSign, LogOut, User, Key, Menu, X, FileText } from 'lucide-react';
import ChangePassword from './ChangePassword';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, isAdmin, userName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const NavLink: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
          isActive
            ? 'bg-indigo-800 text-white'
            : 'text-indigo-100 hover:bg-indigo-700'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {icon}
        <span className="ml-3">{children}</span>
      </Link>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-indigo-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-2xl font-semibold text-white">Project Manager</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {isAdmin ? (
                  <>
                    <NavLink to="/" icon={<Briefcase className="mr-3 h-6 w-6" />}>Dashboard</NavLink>
                    <NavLink to="/team-members" icon={<Users className="mr-3 h-6 w-6" />}>Team Members</NavLink>
                    <NavLink to="/clients" icon={<Users className="mr-3 h-6 w-6" />}>Clients</NavLink>
                    <NavLink to="/projects" icon={<Briefcase className="mr-3 h-6 w-6" />}>Projects</NavLink>
                    <NavLink to="/tasks" icon={<CheckSquare className="mr-3 h-6 w-6" />}>Tasks</NavLink>
                    <NavLink to="/payments" icon={<DollarSign className="mr-3 h-6 w-6" />}>Payments</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/" icon={<Briefcase className="mr-3 h-6 w-6" />}>Dashboard</NavLink>
                    <NavLink to="/your-tasks" icon={<CheckSquare className="mr-3 h-6 w-6" />}>Your Tasks</NavLink>
                    <NavLink to="/payment-history" icon={<FileText className="mr-3 h-6 w-6" />}>Payment History</NavLink>
                  </>
                )}
              </nav>
            </div>
            {currentUser && (
              <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
                <div className="flex items-center">
                  <div>
                    <User className="inline-block h-9 w-9 rounded-full text-indigo-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{userName || currentUser.email}</p>
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="text-xs font-medium text-indigo-200 hover:text-white"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto bg-indigo-800 flex items-center justify-center h-8 w-8 rounded-full hover:bg-indigo-700"
                >
                  <LogOut className="h-5 w-5 text-indigo-200" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className={`fixed inset-0 flex z-40 ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}>
          <div 
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`} 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-indigo-900 transition ease-in-out duration-300 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-2xl font-semibold text-white">Project Manager</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {isAdmin ? (
                  <>
                    <NavLink to="/" icon={<Briefcase className="mr-3 h-6 w-6" />}>Dashboard</NavLink>
                    <NavLink to="/team-members" icon={<Users className="mr-3 h-6 w-6" />}>Team Members</NavLink>
                    <NavLink to="/clients" icon={<Users className="mr-3 h-6 w-6" />}>Clients</NavLink>
                    <NavLink to="/projects" icon={<Briefcase className="mr-3 h-6 w-6" />}>Projects</NavLink>
                    <NavLink to="/tasks" icon={<CheckSquare className="mr-3 h-6 w-6" />}>Tasks</NavLink>
                    <NavLink to="/payments" icon={<DollarSign className="mr-3 h-6 w-6" />}>Payments</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/" icon={<Briefcase className="mr-3 h-6 w-6" />}>Dashboard</NavLink>
                    <NavLink to="/your-tasks" icon={<CheckSquare className="mr-3 h-6 w-6" />}>Your Tasks</NavLink>
                    <NavLink to="/payment-history" icon={<FileText className="mr-3 h-6 w-6" />}>Payment History</NavLink>
                  </>
                )}
              </nav>
            </div>
            {currentUser && (
              <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
                <div className="flex items-center">
                  <div>
                    <User className="inline-block h-9 w-9 rounded-full text-indigo-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{userName || currentUser.email}</p>
                    <button
                      onClick={() => { setShowChangePassword(true); setIsMobileMenuOpen(false); }}
                      className="text-xs font-medium text-indigo-200 hover:text-white"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto bg-indigo-800 flex items-center justify-center h-8 w-8 rounded-full hover:bg-indigo-700"
                >
                  <LogOut className="h-5 w-5 text-indigo-200" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {showChangePassword && (
        <ChangePassword
          userId={currentUser!.uid}
          isAdmin={false}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
};

export default Layout;