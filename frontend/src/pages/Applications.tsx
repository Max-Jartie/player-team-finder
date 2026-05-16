import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatGamerDate } from '../services/formatDate';

interface PlayerApplication {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
  game_slug: string;
  game_data: {
    ingame_nickname: string;
    csstats_url?: string;
    dotabuff_url?: string;
    tracker_gg_url?: string;
  };
  author: {
    user_id: number;
    nickname: string;
    age: number;
    gender: string;
    country: string;
    social_links: unknown[];
  };
}

export const Applications: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState<PlayerApplication[]>([]);
  const [ageFrom, setAgeFrom] = useState<string>('');
  const [ageTo, setAgeTo] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    const params: Record<string, string> = { game_slug: gameSlug || '' };
    if (ageFrom && parseInt(ageFrom) > 10) params.age_from = ageFrom;
    if (ageTo && parseInt(ageTo) > 10) params.age_to = ageTo;
    if (gender) params.gender = gender;
    if (country) params.country = country;

    api.get('/applications/', { params })
      .then((response) => {
        const rawApps: PlayerApplication[] = response.data;
        const currentUserId = user?.id;

        const sortedApps = [...rawApps].sort((a, b) => {
          const aIsMine = a.author?.user_id === currentUserId ? 1 : 0;
          const bIsMine = b.author?.user_id === currentUserId ? 1 : 0;
          return bIsMine - aIsMine;
        });

        setApplications(sortedApps);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка загрузки заявок:', error);
        setLoading(false);
      });
  }, [gameSlug, ageFrom, ageTo, gender, country, user?.id]);

  const handleReset = () => {
    setAgeFrom('');
    setAgeTo('');
    setGender('');
    setCountry('');
  };

  const getStatUrl = (app: PlayerApplication) => {
    return app.game_data.csstats_url || app.game_data.dotabuff_url || app.game_data.tracker_gg_url || '#';
  };

  const isOwnCard = (app: PlayerApplication) =>
    user?.id != null && app.author?.user_id === user.id;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/" className="text-sm text-gray-400 hover:text-csorange transition-colors mb-6 inline-block">
        ← Назад к выбору игр
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 bg-csdark p-5 rounded-lg border border-gray-800 h-fit sticky top-4">
          <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-3">
            <h2 className="font-bold text-lg text-white uppercase tracking-wider">Фильтры</h2>
            <button type="button" onClick={handleReset} className="text-xs text-gray-500 hover:text-csorange transition-colors">
              Сбросить
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Возраст игрока</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(e.target.value)}
                  placeholder="От: 11"
                  className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange"
                />
                <input
                  type="number"
                  value={ageTo}
                  onChange={(e) => setAgeTo(e.target.value)}
                  placeholder="До: 99"
                  className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Пол игрока</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer"
              >
                <option value="">Любой</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Страна (Регион)</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer"
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

        <section className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-csorange uppercase tracking-wide">Заявки: {gameSlug}</h1>
            <p className="text-gray-400 text-sm mt-1">Активные анкеты игроков.</p>
          </div>

          {loading ? (
            <div className="text-gray-500 text-center mt-10">Загрузка карточек игроков...</div>
          ) : applications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/applications/${app.id}`)}
                  className={`bg-csdark p-5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                    isOwnCard(app)
                      ? 'border-csorange/50 shadow-lg shadow-csorange/5 hover:border-csorange'
                      : 'border-gray-800 hover:border-csorange'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white tracking-wide">{app.game_data.ingame_nickname}</h3>
                      <span className="bg-[#12161a] text-xs px-2 py-1 rounded text-csorange border border-gray-800 font-medium uppercase">
                        {app.game_slug}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[40px]">{app.description}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        {app.author.age} лет • {app.author.country} • {app.author.gender === 'male' ? 'Муж' : 'Жен'}
                      </div>
                      {getStatUrl(app) !== '#' && (
                        <span className="text-csorange font-medium hover:underline">Статистика →</span>
                      )}
                    </div>
                    <div className="text-gray-600">{formatGamerDate(app.updated_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12 text-lg">В этой категории пока нет объявлений.</div>
          )}
        </section>
      </div>
    </div>
  );
};
