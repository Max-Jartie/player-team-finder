import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { formatGamerDate } from '../services/formatDate';
import { useAuth } from '../context/AuthContext';

interface ApplicationDetailData {
  id: number;
  description: string;
  status: string;
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
    social_links: { type: string; value: string }[];
  };
}

const getStatUrl = (gameData: ApplicationDetailData['game_data']) =>
  gameData.csstats_url || gameData.dotabuff_url || gameData.tracker_gg_url || '';

const getStatLabel = (slug: string) => {
  if (slug === 'cs2') return 'Профиль CSSTATS.GG';
  if (slug === 'dota2') return 'Профиль DOTABUFF.COM';
  if (slug === 'valorant') return 'Профиль TRACKER.GG';
  return 'Статистика';
};

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [player, setPlayer] = useState<ApplicationDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatUrl, setEditStatUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    api
      .get(`/applications/${id}`)
      .then((response) => {
        setPlayer(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.detail || 'Не удалось загрузить данные объявления.');
        setLoading(false);
      });
  }, [id]);

  const isMine =
    player?.author?.user_id != null && user?.id != null && player.author.user_id === user.id;

  const startEditing = () => {
    if (!player) return;
    setEditNickname(player.game_data.ingame_nickname);
    setEditDescription(player.description);
    setEditStatUrl(getStatUrl(player.game_data));
    setSaveError('');
    setIsEditing(true);
  };

  const buildGameSpecificData = () => {
    const data: Record<string, string> = { ingame_nickname: editNickname };
    if (player?.game_slug === 'cs2') data.csstats_url = editStatUrl;
    if (player?.game_slug === 'dota2') data.dotabuff_url = editStatUrl;
    if (player?.game_slug === 'valorant') data.tracker_gg_url = editStatUrl;
    return data;
  };

  const handleEditToggle = async () => {
    if (!isEditing) {
      startEditing();
      return;
    }
    if (!id || !player) return;

    setSaving(true);
    setSaveError('');
    try {
      const response = await api.put(`/applications/${id}`, {
        description: editDescription,
        game_specific_data: buildGameSpecificData(),
      });
      setPlayer(response.data);
      setIsEditing(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setSaveError(axiosErr.response?.data?.detail || 'Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  const getGenderLabel = (g: string) => (g === 'male' ? 'Мужской' : 'Женский');

  const inputClass =
    'w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange';

  if (loading) {
    return <p className="text-center text-gray-400 mt-20 text-lg">Загрузка подробной анкеты игрока...</p>;
  }

  if (error || !player) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-csdark rounded-lg border border-gray-800 text-center shadow-xl">
        <div className="text-red-500 text-sm mb-4 bg-red-950/50 border border-red-900 p-3 rounded">
          {error || 'Объявление не найдено.'}
        </div>
        <button type="button" onClick={() => window.history.back()} className="text-csorange hover:underline text-sm">
          ← Назад к списку
        </button>
      </div>
    );
  }

  const statUrl = getStatUrl(player.game_data);
  const hasStatField = ['cs2', 'dota2', 'valorant'].includes(player.game_slug);

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-csdark rounded-lg border border-gray-800 shadow-2xl">
      <div className="flex justify-between items-start mb-6 gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 hover:text-csorange transition-colors cursor-pointer"
        >
          ← Вернуться к списку заявок
        </button>
        {isMine && (
          <button
            type="button"
            onClick={handleEditToggle}
            disabled={saving}
            className="text-sm font-medium text-csorange hover:underline disabled:opacity-50 whitespace-nowrap"
          >
            {isEditing ? (saving ? 'Сохранение...' : '💾 Сохранить') : '✏️ Изменить'}
          </button>
        )}
      </div>

      {saveError && (
        <div className="text-red-500 text-xs bg-red-950/50 border border-red-900 p-2 rounded mb-4 text-center">
          {saveError}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-400 border-b border-gray-800 pb-2 mb-4 tracking-wide uppercase text-sm">
          Общая информация
        </h2>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 py-1 items-center">
            <span className="text-gray-500">Игровой ник</span>
            {isEditing ? (
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className={`col-span-2 ${inputClass}`}
              />
            ) : (
              <span className="col-span-2 font-bold text-csorange text-base">{player.game_data.ingame_nickname}</span>
            )}
          </div>

          <div className="grid grid-cols-3 py-1">
            <span className="text-gray-500">Пол</span>
            <span className="col-span-2 text-gray-200">{getGenderLabel(player.author.gender)}</span>
          </div>

          <div className="grid grid-cols-3 py-1">
            <span className="text-gray-500">Возраст</span>
            <span className="col-span-2 text-gray-200">{player.author.age} лет</span>
          </div>

          <div className="grid grid-cols-3 py-1 items-center">
            <span className="text-gray-500">Страна</span>
            <span className="col-span-2 text-gray-200 flex items-center gap-2">
              <span className="uppercase font-semibold text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 border border-gray-700">
                {player.author.country}
              </span>
            </span>
          </div>

          {(statUrl || (isEditing && hasStatField)) && (
            <div className="grid grid-cols-3 py-1 items-center">
              <span className="text-gray-500">Игровая статистика</span>
              {isEditing && hasStatField ? (
                <input
                  type="url"
                  value={editStatUrl}
                  onChange={(e) => setEditStatUrl(e.target.value)}
                  className={`col-span-2 ${inputClass}`}
                />
              ) : (
                <span className="col-span-2">
                  <a href={statUrl} target="_blank" rel="noreferrer" className="text-csorange hover:underline font-medium">
                    {getStatLabel(player.game_slug)} →
                  </a>
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 py-1 border-t border-gray-900 pt-3">
            <span className="text-gray-500">Опубликована</span>
            <span className="col-span-2 text-gray-400">{formatGamerDate(player.created_at)}</span>
          </div>

          <div className="grid grid-cols-3 py-1">
            <span className="text-gray-500">Последнее изменение</span>
            <span className="col-span-2 text-gray-400">{formatGamerDate(player.updated_at)}</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-400 border-b border-gray-800 pb-2 mb-4 tracking-wide uppercase text-sm">
          Дополнительное описание
        </h2>
        {isEditing ? (
          <textarea
            rows={5}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#12161a] p-4 rounded border border-gray-900">
            {player.description}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-400 border-b border-gray-800 pb-2 mb-4 tracking-wide uppercase text-sm">
          Контакты для связи
        </h2>
        {player.author.social_links && player.author.social_links.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {player.author.social_links.map((link, idx) => (
              <div
                key={idx}
                className="bg-[#12161a] border border-gray-800 px-4 py-2 rounded text-xs flex items-center gap-2"
              >
                <span className="text-csorange uppercase font-bold">{link.type}:</span>
                <span className="text-gray-200 font-medium">{link.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs italic">Игрок не оставил дополнительных контактов в профиле.</p>
        )}
      </section>
    </div>
  );
};
