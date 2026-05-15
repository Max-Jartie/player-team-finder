import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: number;
  title: string;
  slug: string;
  image: string; // заменить потом на URL картинки
}

export const Games: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');

  //список игр
  const gamesList: Game[] = [
    { id: 1, title: 'Counter-Strike 2', slug: 'cs2', image: '🎮' },
    { id: 2, title: 'Dota 2', slug: 'dota2', image: '⚔️' },
    { id: 3, title: 'Valorant', slug: 'valorant', image: '🎯' },
    { id: 4, title: 'Minecraft', slug: 'minecraft', image: '🧱' },
  ];

  // Фильтрация списка игр по вводу пользователя
  const filteredGames = gamesList.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide">Выберите игру</h1>
        
        {/* Инпут живого поиска */}
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

      {/* Сетка карточек игр */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => navigate(`/games/${game.slug}`)}
              className="bg-csdark p-6 rounded-lg border border-gray-800 hover:border-csorange cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center min-h-[160px] group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{game.image}</div>
              <h2 className="text-xl font-bold text-center text-gray-200 group-hover:text-csorange transition-colors">
                {game.title}
              </h2>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-12 text-lg">
          Игры с таким названием не найдены
        </div>
      )}
    </div>
  );
};
