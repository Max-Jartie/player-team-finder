import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Описываем структуру данных для карточки игрока
interface PlayerApplication {
  id: number;
  nickname: string;
  game: string;
  description: string;
  age: number;
  country: string;
  gender: 'male' | 'female';
  statUrl: string;
  statLabel: string;
}

export const Applications: React.FC = () => {
  // Получаем slug игры из URL
  const { gameSlug } = useParams<{ gameSlug: string }>();

  // Состояния для боковых фильтров
  const [ageFrom, setAgeFrom] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  // Временная база данных заявок для всех игр
  const allApplications: PlayerApplication[] = [
    {
      id: 1,
      nickname: 'Spawn',
      game: 'cs2',
      description: 'Ищу сыгранный стак для Faceit 10 lvl. Играю каждый день вечером, позиция — AWP.',
      age: 22,
      country: 'RU',
      gender: 'male',
      statUrl: 'https://csstats.gg',
      statLabel: 'csstats.gg'
    },
    {
      id: 2,
      nickname: 'Cyber_Katya',
      game: 'cs2',
      description: 'Пойду в команду на замену или постоянную основу. Премьер режим 20к+ ПТС. Без токсичности.',
      age: 19,
      country: 'BY',
      gender: 'female',
      statUrl: 'https://csstats.gg',
      statLabel: 'csstats.gg'
    },
    {
      id: 3,
      nickname: 'SoloMid_King',
      game: 'dota2',
      description: 'Ищу команду для участия в боевых кубках (Battle Cup). ММР 5500+, играю строго на миду.',
      age: 20,
      country: 'RU',
      gender: 'male',
      statUrl: 'https://dotabuff.com',
      statLabel: 'dotabuff.com'
    },
    {
      id: 4,
      nickname: 'Dendi_Fan',
      game: 'dota2',
      description: 'Ищу саппорта 4/5 позиции для поднятия рейтинга в пати. Позитивный настрой, связь Дискорд.',
      age: 25,
      country: 'KZ',
      gender: 'male',
      statUrl: 'https://dotabuff.com',
      statLabel: 'dotabuff.com'
    },
    {
      id: 5,
      nickname: 'Jett_Main',
      game: 'valorant',
      description: 'Ищу дуо для калибровки и фаст рангов. Текущий ранг — Алмаз 2. Играю на дуэлянтах.',
      age: 18,
      country: 'UA',
      gender: 'female',
      statUrl: 'https://tracker.gg',
      statLabel: 'tracker.gg'
    },
    {
      id: 6,
      nickname: 'Steve_Builder',
      game: 'minecraft',
      description: 'Ищу людей на приватный ванильный сервер. Строим масштабные проекты, 16+, наличие микрофона.',
      age: 17,
      country: 'RU',
      gender: 'male',
      statUrl: '#',
      statLabel: 'Профиль'
    }
  ];

  // Многоуровневая фильтрация массива данных
  const filteredApplications = allApplications.filter((app) => {
    //фильтрация по игре из URL адреса
    if (app.game !== gameSlug) return false;

    //Фильтрация по минимальному возрасту (если введен)
    if (ageFrom && app.age < parseInt(ageFrom)) return false;

    //Фильтрация по полу (если выбран)
    if (gender && app.gender !== gender) return false;

    //Фильтрация по стране (если выбрана)
    if (country && app.country !== country) return false;

    return true;
  });

  const handleReset = () => {
    setAgeFrom('');
    setGender('');
    setCountry('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/" className="text-sm text-gray-400 hover:text-csorange transition-colors mb-6 inline-block">
        ← Назад к выбору игр
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Боковая панель фильтров */}
        <aside className="w-full md:w-64 bg-csdark p-5 rounded-lg border border-gray-800 h-fit sticky top-4">
          <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-3">
            <h2 className="font-bold text-lg text-white uppercase tracking-wider">Фильтры</h2>
            <button onClick={handleReset} className="text-xs text-gray-500 hover:text-csorange transition-colors">
              Сбросить
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Минимальный возраст
              </label>
              <input
                type="number"
                value={ageFrom}
                onChange={(e) => setAgeFrom(e.target.value)}
                placeholder="Например: 18"
                className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Пол игрока
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors cursor-pointer"
              >
                <option value="">Любой</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Страна (Регион)
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors cursor-pointer"
              >
                <option value="">Все страны</option>
                <option value="RU">Россия (RU)</option>
                <option value="BY">Беларусь (BY)</option>
                <option value="KZ">Казахстан (KZ)</option>
                <option value="UA">Украина (UA)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Сетка карточек заявок */}
        <section className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-csorange uppercase tracking-wide">
              Заявки: {gameSlug}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Активные анкеты игроков по выбранной дисциплине.</p>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredApplications.map((app) => (
                <div key={app.id} className="bg-csdark p-5 rounded-lg border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white tracking-wide">{app.nickname}</h3>
                      <span className="bg-[#12161a] text-xs px-2 py-1 rounded text-csorange border border-gray-800 font-medium uppercase">
                        {app.game}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {app.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
                    <div>
                      {app.age} лет • {app.country} • {app.gender === 'male' ? 'Муж' : 'Жен'}
                    </div>
                    {app.statUrl !== '#' && (
                      <a href={app.statUrl} target="_blank" rel="noreferrer" className="text-csorange hover:underline font-medium">
                        {app.statLabel} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12 text-lg">
              Пока нет объявлений, соответствующих выбранным фильтрам
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
