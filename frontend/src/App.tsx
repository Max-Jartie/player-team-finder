import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Games } from './pages/Games';
import { Applications } from './pages/Applications';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { CreateApplication } from './pages/CreateApplication';

const Navigation: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-csdark border-b border-gray-800 p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-csorange tracking-wider">
        TEAM.FINDER
      </Link>
      
      <div className="space-x-6 text-sm font-medium flex items-center">
        <Link to="/" className="hover:text-csorange transition-colors">Игры</Link>
        <Link to="/create" className="hover:text-csorange transition-colors">Создать заявку</Link>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-200 font-semibold bg-[#12161a] border border-gray-800 px-3 py-1.5 rounded hover:border-csorange hover:text-csorange transition-all cursor-pointer"
            >
              <span>👤 Профиль</span>
            </button>
            
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Выйти
            </button>
          </div>
        ) : (
          <Link to="/auth" className="bg-csorange text-black px-4 py-2 rounded font-bold hover:bg-opacity-90 transition-colors">
            Войти
          </Link>
        )}
      </div>
    </nav>
  );
};
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={<Games />} />
            <Route path="/games/:gameSlug" element={<Applications />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreateApplication />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
