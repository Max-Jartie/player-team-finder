import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { CreateApplication } from './pages/CreateApplication';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Шапка сайта */}
      <nav className="bg-csdark border-b border-gray-800 p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-csorange tracking-wider">
          TEAM.FINDER
        </Link>
        <div className="space-x-6 text-sm font-medium flex items-center">
          <Link to="/" className="hover:text-csorange transition-colors">Главная</Link>
          <Link to="/create" className="hover:text-csorange transition-colors">Создать заявку</Link>
          <Link to="/profile" className="hover:text-csorange transition-colors">Профиль</Link>
          <Link to="/auth" className="bg-csorange text-white px-4 py-2 rounded font-bold hover:bg-opacity-90 transition-colors">
            Войти
          </Link>
        </div>
      </nav>

      {/* Контент страниц */}
      <main className="container mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<CreateApplication />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
