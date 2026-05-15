import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-csorange mb-6">Поиск игроков и команд</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Временная тестовая карточка */}
        <div className="bg-csdark p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold">Spawn (CS2)</h2>
          <p className="text-gray-400 mt-2">Ищу сыгранный стак для Faceit 10 lvl.</p>
          <div className="mt-4 text-sm text-csorange">Возраст: 22 | Страна: RU</div>
        </div>
      </div>
    </div>
  );
};
