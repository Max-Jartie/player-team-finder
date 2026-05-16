import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Импортируем наш настроенный сетевой слой

interface Game {
  id: number;
  title: string;
  slug: string;
  applications_count: number;
}

export const Games: React.FC = () => {
  const navigate = useNavigate();
  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Фоновый запрос к FastAPI при открытии страницы
  useEffect(() => {
    api.get('/games/')
      .then((response) => {
        setGamesList(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка загрузки игр:', error);
        setLoading(false);
      });
  }, []);

  // Фильтрация списка игр по вводу пользователя
  const filteredGames = gamesList.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Временные эмодзи)))
  const getGameEmoji = (slug: string) => {
    if (slug === 'cs2') return '🎮';
    if (slug === 'dota2') return '⚔️';
    if (slug === 'valorant') return '🎯';
    return '🧱';
  };

  if (loading) {
    return <div className="text-center text-gray-400 mt-20 text-lg">Загрузка доступных дисциплин...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide">Выберите игру</h1>
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск игры по названию..."
            className="w-full bg-csdark border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-csorange transition-colors"
          />
        </div>
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => navigate(`/games/${game.slug}`)}
              className="bg-csdark p-6 rounded-lg border border-gray-800 hover:border-csorange cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center min-h-[160px] group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {getGameEmoji(game.slug)}
              </div>
              <h2 className="text-xl font-bold text-center text-gray-200 group-hover:text-csorange transition-colors">
                {game.title}
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                {game.applications_count}{' '}
                {game.applications_count === 1
                  ? 'заявка'
                  : game.applications_count >= 2 && game.applications_count <= 4
                    ? 'заявки'
                    : 'заявок'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-12 text-lg">Игры не найдены</div>
      )}
    </div>
  );
};
