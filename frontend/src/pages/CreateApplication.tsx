import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CreateApplication: React.FC = () => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  const userProfileFromDB = {
    age: "22",
    gender: "male",
    country: "RU"
  };

  // СОСТОЯНИЕ ФОРМЫ ЗАЯВКИ
  const [selectedGame, setSelectedGame] = useState<string>('cs2');
  const [gameNickname, setGameNickname] = useState<string>(''); // Отдельный ник для конкретной игры!
  const [description, setDescription] = useState<string>('');
  
  // Поля для динамического JSONB блока
  const [csstatsUrl, setCsstatsUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // данные под бэкенд и СУБД PostgreSQL (JSONB)
    const payload = {
      game_slug: selectedGame,
      description: description,
      auto_profile_data: {
        age: userProfileFromDB.age,
        gender: userProfileFromDB.gender,
        country: userProfileFromDB.country
      },
      game_specific_data: {
        ingame_nickname: gameNickname,
        ...(selectedGame === 'cs2' && { csstats_url: csstatsUrl })
      }
    };

    console.log('Отправка заявки на бэкенд (FastAPI):', payload);
    alert(`Заявка для игры ${selectedGame.toUpperCase()} успешно создана! (симуляция)`);
    navigate(`/games/${selectedGame}`);
  };

  //ОТОБРАЖЕНИЕ ДЛЯ ГОСТЯ
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-csdark rounded-lg border border-gray-800 text-center shadow-xl relative">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-white mb-2">Создание заявки</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Чтобы опубликовать анкету по поиску команды, вам необходимо авторизоваться. Данные вашего профиля подставятся автоматически.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-csorange text-black font-bold py-2.5 px-6 rounded uppercase tracking-wider text-sm hover:bg-opacity-90 transition-colors w-full"
        >
          Войти в аккаунт
        </button>
      </div>
    );
  }

  //ОТОБРАЖЕНИЕ ДЛЯ ПОЛЬЗОВАТЕЛЯ
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-csdark rounded-lg border border-gray-800 shadow-xl relative">

      <h2 className="text-2xl font-bold text-csorange mb-2 uppercase tracking-wide">Создать заявку</h2>
      <p className="text-gray-400 text-xs mb-6">
        Заполните параметры поиска. Информация о вашем возрасте ({userProfileFromDB.age} г.), поле и стране добавится автоматически из ЛК.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Выбор игры */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Выберите дисциплину</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors cursor-pointer"
          >
            <option value="cs2">Counter-Strike 2</option>
            <option value="dota2">Dota 2</option>
            <option value="valorant">Valorant</option>
            <option value="minecraft">Minecraft</option>
          </select>
        </div>

        {/* Уникальный игровой никнейм */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Игровой никнейм
          </label>
          <input
            type="text"
            required
            value={gameNickname}
            onChange={(e) => setGameNickname(e.target.value)}
            placeholder="Например: s1mple_fan"
            className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors"
          />
        </div>

        {/* Специфичные поля в зависимости от выбранной игры (Блок под будущий JSONB) */}
        {selectedGame === 'cs2' && (
          <div className="p-4 bg-[#12161a] rounded border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-csorange uppercase tracking-wider">Параметры Counter-Strike 2</h4>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Ссылка на профиль CSSTATS.GG</label>
              <input
                type="url"
                required
                value={csstatsUrl}
                onChange={(e) => setCsstatsUrl(e.target.value)}
                placeholder="https://csstats.gg..."
                className="w-full bg-csdark border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors"
              />
            </div>
          </div>
        )}

        {selectedGame !== 'cs2' && (
          <div className="p-4 bg-[#12161a] rounded border border-gray-800 text-center text-xs text-gray-500">
            Для игры {selectedGame.toUpperCase()} пока нет дополнительных полей. Будет отправлен только ник и описание.
          </div>
        )}

        {/* Описание в свободной форме */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Описание заявки</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Расскажите о своих целях, игровом времени, роли в команде и требованиях к тиммейтам..."
            className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors resize-none"
          />
        </div>

        {/* Кнопка отправки формы */}
        <button
          type="submit"
          className="w-full bg-csorange text-black font-bold py-2.5 px-4 rounded mt-2 hover:bg-opacity-90 transition-colors uppercase tracking-wider text-sm"
        >
          Опубликовать объявление
        </button>
      </form>
    </div>
  );
};
