import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { formatGamerDate } from '../services/formatDate';

type Tab = 'users' | 'applications' | 'games';
type ApplicationStatusFilter = 'all' | 'active' | 'hidden';

interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  is_admin: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  profile?: { nickname: string; age: number; gender: string; country: string };
}

interface AdminApplication {
  id: number;
  description: string;
  status: string;
  updated_at: string;
  game_slug: string;
  game_data: { ingame_nickname: string };
  author_nickname: string;
  author_email: string;
}

interface AdminGame {
  id: number;
  title: string;
  slug: string;
  is_active: boolean;
}

const getStatusLabel = (status: string) => (status === 'active' ? 'Активная' : 'Скрытая');

const getStatusClass = (status: string) =>
  status === 'active'
    ? 'text-green-400 border-green-900 bg-green-950/30'
    : 'text-csorange border-orange-900/50 bg-orange-950/20';

export const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(false);

  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [banReason, setBanReason] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatusFilter>('all');

  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameSlug, setNewGameSlug] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadUsers = useCallback(async () => {
    const res = await api.get<AdminUser[]>('/admin/users');
    setUsers(res.data);
  }, []);

  const loadApplications = useCallback(async () => {
    const params: Record<string, string> = {};
    if (appStatusFilter !== 'all') {
      params.status = appStatusFilter;
    }
    const res = await api.get<AdminApplication[]>('/admin/applications', { params });
    setApplications(res.data);
  }, [appStatusFilter]);

  const loadGames = useCallback(async () => {
    const res = await api.get<AdminGame[]>('/admin/games');
    setGames(res.data);
  }, []);

  const loadTabData = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      if (tab === 'users') await loadUsers();
      if (tab === 'applications') await loadApplications();
      if (tab === 'games') await loadGames();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось загрузить данные.');
    } finally {
      setLoading(false);
    }
  }, [tab, loadUsers, loadApplications, loadGames]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const handleBan = async (userId: number) => {
    if (banReason.trim().length < 3) {
      setError('Укажите причину блокировки (минимум 3 символа).');
      return;
    }
    clearMessages();
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason: banReason.trim() });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: true, ban_reason: banReason.trim() } : u
        )
      );
      setBanUserId(null);
      setBanReason('');
      setSuccess('Пользователь заблокирован.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось заблокировать пользователя.');
    }
  };

  const handleUnban = async (userId: number) => {
    clearMessages();
    try {
      await api.post(`/admin/users/${userId}/unban`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u))
      );
      setSuccess('Пользователь разблокирован.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось разблокировать пользователя.');
    }
  };

  const handleHideApplication = async (appId: number) => {
    clearMessages();
    try {
      await api.patch(`/admin/applications/${appId}/hide`);
      setApplications((prev) => {
        if (appStatusFilter === 'active') {
          return prev.filter((a) => a.id !== appId);
        }
        return prev.map((a) => (a.id === appId ? { ...a, status: 'hidden' } : a));
      });
      setSuccess('Заявка скрыта.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось скрыть заявку.');
    }
  };

  const handleDeleteApplication = async (appId: number) => {
    clearMessages();
    try {
      await api.delete(`/admin/applications/${appId}`);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      setSuccess('Заявка удалена.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось удалить заявку.');
    }
  };

  const handleApplicationAction = (app: AdminApplication) => {
    if (app.status === 'active') {
      handleHideApplication(app.id);
    } else {
      handleDeleteApplication(app.id);
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await api.post<AdminGame>('/admin/games', {
        title: newGameTitle.trim(),
        slug: newGameSlug.trim().toLowerCase(),
      });
      setGames((prev) => [...prev, res.data]);
      setNewGameTitle('');
      setNewGameSlug('');
      setSuccess('Игра добавлена.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось добавить игру.');
    }
  };

  const handleToggleGame = async (gameId: number) => {
    clearMessages();
    try {
      const res = await api.put<AdminGame>(`/admin/games/${gameId}`);
      setGames((prev) => prev.map((g) => (g.id === gameId ? res.data : g)));
      setSuccess(res.data.is_active ? 'Игра показана на сайте.' : 'Игра скрыта с сайта.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Не удалось изменить статус игры.');
    }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded transition-colors ${
      tab === t ? 'bg-csorange text-white' : 'bg-[#12161a] text-gray-400 hover:text-white border border-gray-800'
    }`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-csorange uppercase tracking-wide mb-2">Панель администратора</h1>
      <p className="text-gray-400 text-sm mb-6">Модерация пользователей, заявок и игр.</p>

      {error && (
        <div className="text-red-500 text-sm bg-red-950/50 border border-red-900 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="text-green-400 text-sm bg-green-950/40 border border-green-900 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button type="button" onClick={() => setTab('users')} className={tabClass('users')}>
          Пользователи
        </button>
        <button type="button" onClick={() => setTab('applications')} className={tabClass('applications')}>
          Заявки
        </button>
        <button type="button" onClick={() => setTab('games')} className={tabClass('games')}>
          Игры
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Загрузка...</p>
      ) : (
        <>
          {tab === 'users' && (
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#12161a] text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Ник</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Действие</th>
                    <th className="px-4 py-3">Причина</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="bg-csdark hover:bg-[#1a1f24]">
                      <td className="px-4 py-3 text-gray-300">{u.id}</td>
                      <td className="px-4 py-3 text-white">{u.email}</td>
                      <td className="px-4 py-3 text-gray-300">{u.profile?.nickname ?? '—'}</td>
                      <td className="px-4 py-3">
                        {u.is_admin ? (
                          <span className="text-csorange text-xs font-bold uppercase">Админ</span>
                        ) : u.is_banned ? (
                          <span className="text-red-400 text-xs">Забанен</span>
                        ) : (
                          <span className="text-green-400 text-xs">Активен</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!u.is_admin && !u.is_banned && (
                          <>
                            {banUserId === u.id ? (
                              <div className="flex flex-col gap-2 min-w-[200px]">
                                <input
                                  type="text"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                  placeholder="Причина блокировки"
                                  className="bg-[#12161a] border border-gray-800 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-csorange"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleBan(u.id)}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                                  >
                                    Подтвердить
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBanUserId(null);
                                      setBanReason('');
                                    }}
                                    className="text-xs text-gray-400 hover:text-white"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setBanUserId(u.id);
                                  setBanReason('');
                                  clearMessages();
                                }}
                                className="text-xs text-red-400 border border-red-900 px-2 py-1 rounded hover:bg-red-950/50"
                              >
                                Заблокировать
                              </button>
                            )}
                          </>
                        )}
                        {!u.is_admin && u.is_banned && (
                          <button
                            type="button"
                            onClick={() => handleUnban(u.id)}
                            className="text-xs text-green-400 border border-green-900 px-2 py-1 rounded hover:bg-green-950/30 font-medium"
                          >
                            Разблокировать
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px]">
                        {u.is_banned && u.ban_reason ? u.ban_reason : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'applications' && (
            <div className="flex flex-col md:flex-row gap-6">
              <aside className="w-full md:w-56 shrink-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Статус заявок
                </label>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value as ApplicationStatusFilter)}
                  className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer"
                >
                  <option value="all">Все</option>
                  <option value="active">Активные</option>
                  <option value="hidden">Скрытые</option>
                </select>
              </aside>

              <div className="flex-1 grid gap-4">
                {applications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Заявок не найдено.</p>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-csdark border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 font-mono">#{app.id}</span>
                          <span
                            className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${getStatusClass(app.status)}`}
                          >
                            {getStatusLabel(app.status)}
                          </span>
                          <span className="text-xs uppercase bg-[#12161a] px-2 py-0.5 rounded border border-gray-800 text-gray-400">
                            {app.game_slug}
                          </span>
                        </div>
                        <p className="font-bold text-csorange text-base mb-1">{app.game_data.ingame_nickname}</p>
                        <p className="text-gray-400 text-sm line-clamp-2">{app.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {app.author_nickname} ({app.author_email}) · {formatGamerDate(app.updated_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplicationAction(app)}
                        className={`text-xs font-medium border px-3 py-2 rounded shrink-0 transition-colors ${
                          app.status === 'active'
                            ? 'text-csorange border-orange-900/50 hover:bg-orange-950/20'
                            : 'text-red-400 border-red-900 hover:bg-red-950/50'
                        }`}
                      >
                        {app.status === 'active' ? 'Скрыть' : 'Удалить'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'games' && (
            <div className="space-y-6">
              <form onSubmit={handleAddGame} className="bg-csdark border border-gray-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Добавить игру</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={newGameTitle}
                    onChange={(e) => setNewGameTitle(e.target.value)}
                    placeholder="Название (Counter-Strike 2)"
                    className="bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange"
                  />
                  <input
                    type="text"
                    required
                    value={newGameSlug}
                    onChange={(e) => setNewGameSlug(e.target.value)}
                    placeholder="slug (cs2)"
                    pattern="[a-z0-9_-]+"
                    className="bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-csorange text-white font-bold text-xs uppercase px-4 py-2 rounded hover:bg-opacity-90"
                >
                  Добавить
                </button>
              </form>

              <div className="space-y-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="bg-csdark border border-gray-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{game.title}</p>
                      <p className="text-xs text-gray-500">{game.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGame(game.id)}
                      className={`text-xs font-semibold uppercase px-3 py-2 rounded border transition-colors ${
                        game.is_active
                          ? 'text-green-400 border-green-900 hover:bg-green-950/30'
                          : 'text-gray-400 border-gray-700 hover:border-csorange'
                      }`}
                    >
                      {game.is_active ? 'Скрыть' : 'Показать'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
