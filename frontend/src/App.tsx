import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { CreateApplication } from './pages/CreateApplication';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Шапка сайта (Навигационная панель) */}
      <nav className="bg-csdark border-b border-gray-800 p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-csorange tracking-wider">
          TEAM.FINDER
        </Link>
        <div className="space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-csorange transition-colors">Главная</Link>
          <Link to="/create" className="hover:text-csorange transition-colors">Создать заявку</Link>
          <Link to="/profile" className="hover:text-csorange transition-colors">Профиль</Link>
          <Link to="/login" className="hover:text-csorange transition-colors">Войти</Link>
          <Link to="/register" className="bg-csorange text-white px-3 py-1.5 rounded font-bold hover:bg-opacity-90 transition-colors">Регистрация</Link>
        </div>
      </nav>

      {/* Контент текущей страницы */}
      <main className="container mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<CreateApplication />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
