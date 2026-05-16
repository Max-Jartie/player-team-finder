import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface GameOption {
  id: number;
  title: string;
  slug: string;
}

export const CreateApplication: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [games, setGames] = useState<GameOption[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [gameNickname, setGameNickname] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [csstatsUrl, setCsstatsUrl] = useState<string>('');
  const [dotabuffUrl, setDotabuffUrl] = useState<string>('');
  const [trackerGgUrl, setTrackerGgUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    api
      .get<GameOption[]>('/games/')
      .then((response) => {
        const list = response.data;
        setGames(list);
        if (list.length > 0) {
          setSelectedGame(list[0].slug);
        }
        setGamesLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить список игр.');
        setGamesLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedGame) {
      setError('Выберите дисциплину.');
      return;
    }

    if (gameNickname.trim().length < 2) {
      setError('Игровой никнейм должен быть длиннее 2 символов.');
      return;
    }

    if (selectedGame === 'cs2') {
      const csstatsRegex = /^https?:\/\/(www\.)?csstats\.gg\/([a-zA-Z-]+\/)?player\/\d+/;
      if (!csstatsRegex.test(csstatsUrl)) {
        setError('Введите корректную ссылку на профиль csstats.gg.');
        return;
      }
    }

    if (selectedGame === 'dota2') {
      const dotabuffRegex = /^https?:\/\/([a-zA-Z-]+\.)?dotabuff\.com\/players\/\d+/;
      if (!dotabuffRegex.test(dotabuffUrl)) {
        setError('Введите корректную ссылку на профиль dotabuff.com.');
        return;
      }
    }

    if (selectedGame === 'valorant') {
      const trackerGgRegex = /^https?:\/\/(www\.)?tracker\.gg\/valorant\/profile\/(riot|steam|psn|xbox)\/.+/;
      if (!trackerGgRegex.test(trackerGgUrl)) {
        setError('Введите корректную ссылку на профиль tracker.gg.');
        return;
      }
    }

    const gameSpecificData: Record<string, string> = { ingame_nickname: gameNickname };
    if (selectedGame === 'cs2') gameSpecificData.csstats_url = csstatsUrl;
    if (selectedGame === 'dota2') gameSpecificData.dotabuff_url = dotabuffUrl;
    if (selectedGame === 'valorant') gameSpecificData.tracker_gg_url = trackerGgUrl;

    try {
      await api.post('/applications/', {
        game_slug: selectedGame,
        description: description,
        game_specific_data: gameSpecificData,
      });

      setSuccessMessage('Ваше объявление успешно опубликовано!');
      setTimeout(() => navigate(`/games/${selectedGame}`), 1200);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось опубликовать объявление. Проверьте, заполнен ли ЛК.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-csdark rounded-lg border border-gray-800 text-center shadow-xl">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-white mb-2">Создание заявки</h2>
        <p className="text-gray-400 text-sm mb-6">Чтобы опубликовать анкету по поиску команды, вам необходимо войти в свой аккаунт.</p>
        <button type="button" onClick={() => navigate('/auth')} className="bg-csorange text-white font-bold py-2.5 px-6 rounded uppercase tracking-wider text-sm w-full">
          Войти в аккаунт
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-csdark rounded-lg border border-gray-800 shadow-xl">
      <h2 className="text-2xl font-bold text-csorange mb-2 uppercase tracking-wide">Создать заявку</h2>
      <p className="text-gray-400 text-xs mb-6">Заполните параметры поиска. Анкета привяжется к вашему возрасту и региону из ЛК.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="text-red-500 text-xs bg-red-950/50 border border-red-900 p-2 rounded text-center mb-2">{error}</div>}
        {successMessage && (
          <div className="text-green-400 text-xs bg-green-950/40 border border-green-900 p-2 rounded text-center mb-2">
            {successMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Выберите дисциплину</label>
          {gamesLoading ? (
            <p className="text-gray-500 text-sm">Загрузка игр...</p>
          ) : games.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет доступных игр для публикации заявки.</p>
          ) : (
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer"
            >
              {games.map((game) => (
                <option key={game.id} value={game.slug}>
                  {game.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Игровой никнейм (внутри игры {selectedGame.toUpperCase() || '—'})
          </label>
          <input
            type="text"
            required
            value={gameNickname}
            onChange={(e) => setGameNickname(e.target.value)}
            placeholder="Например: s1mple_fan"
            className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange"
          />
        </div>

        {selectedGame === 'cs2' && (
          <div className="p-4 bg-[#12161a] rounded border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-csorange uppercase tracking-wider">Параметры Counter-Strike 2</h4>
            <input type="url" required value={csstatsUrl} onChange={(e) => setCsstatsUrl(e.target.value)} placeholder="https://csstats.gg..." className="w-full bg-csdark border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange" />
          </div>
        )}

        {selectedGame === 'dota2' && (
          <div className="p-4 bg-[#12161a] rounded border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-csorange uppercase tracking-wider">Параметры Dota 2</h4>
            <input type="url" required value={dotabuffUrl} onChange={(e) => setDotabuffUrl(e.target.value)} placeholder="https://dotabuff.com..." className="w-full bg-csdark border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange" />
          </div>
        )}

        {selectedGame === 'valorant' && (
          <div className="p-4 bg-[#12161a] rounded border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-csorange uppercase tracking-wider">Параметры Valorant</h4>
            <input type="url" required value={trackerGgUrl} onChange={(e) => setTrackerGgUrl(e.target.value)} placeholder="https://tracker.gg..." className="w-full bg-csdark border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange" />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Описание заявки</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Расскажите о своих целях..." className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange resize-none" />
        </div>

        <button type="submit" disabled={gamesLoading || games.length === 0} className="w-full bg-csorange text-white font-bold py-2.5 px-4 rounded mt-2 hover:bg-opacity-90 uppercase tracking-wider text-sm disabled:opacity-50">
          Опубликовать объявление
        </button>
      </form>
    </div>
  );
};
