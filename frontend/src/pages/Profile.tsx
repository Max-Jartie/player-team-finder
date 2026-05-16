import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface SocialLink {
  type: string;
  value: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [nickname, setNickname] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('male');
  const [country, setCountry] = useState<string>('RU');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/profile/')
        .then((response) => {
          const p = response.data;
          setNickname(p.nickname);
          setAge(p.age.toString());
          setGender(p.gender);
          setCountry(p.country);
          setSocialLinks(p.social_links || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isLoggedIn]);

  const addSocialField = () => {
    setSocialLinks([...socialLinks, { type: 'telegram', value: '' }]);
  };

  const removeSocialField = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialField = (index: number, key: 'type' | 'value', val: string) => {
    setSocialLinks(socialLinks.map((link, i) => i === index ? { ...link, [key]: val } : link));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge <= 10) {
      setError('Возраст должен быть строго больше 10 лет.');
      return;
    }

    try {
      await api.put('/profile/', {
        nickname,
        age: parsedAge,
        gender,
        country,
        social_links: socialLinks
      });
      setSuccessMessage('Профиль успешно обновлён!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось сохранить профиль.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-csdark rounded-lg border border-gray-800 text-center shadow-xl">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h2>
        <p className="text-gray-400 text-sm mb-6">Чтобы настраивать профиль, необходимо войти в аккаунт.</p>
        <button onClick={() => navigate('/auth')} className="bg-csorange text-white font-bold py-2.5 px-6 rounded uppercase tracking-wider text-sm w-full">Перейти к авторизации</button>
      </div>
    );
  }

  if (loading) return <div className="text-center text-gray-400 mt-20">Загрузка данных ЛК...</div>;

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-csdark rounded-lg border border-gray-800 shadow-xl">
      <h2 className="text-2xl font-bold text-csorange mb-2 uppercase tracking-wide">Личный кабинет</h2>
      <p className="text-gray-400 text-xs mb-6">Информация ниже используется для автозаполнения ваших заявок.</p>

      <form onSubmit={handleSave} className="space-y-5">
        {error && <div className="text-red-500 text-xs bg-red-950/50 border border-red-900 p-2 rounded text-center mb-2">{error}</div>}
        {successMessage && (
          <div className="text-green-400 text-xs bg-green-950/40 border border-green-900 p-2 rounded text-center mb-2">
            {successMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Игровой никнейм на сайте</label>
          <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Возраст</label>
            <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Пол</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer"><option value="male">Мужской</option><option value="female">Женский</option></select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Страна</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer"><option value="RU">Россия (RU)</option><option value="BY">Беларусь (BY)</option><option value="KZ">Казахстан (KZ)</option><option value="UA">Украина (UA)</option></select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center mb-3"><label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Контакты / Соцсети</label><button type="button" onClick={addSocialField} className="text-xs bg-gray-800 text-csorange px-2 py-1 rounded hover:bg-gray-700">+ Добавить ссылку</button></div>
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-3 items-center">
                <select value={link.type} onChange={(e) => updateSocialField(index, 'type', e.target.value)} className="bg-[#12161a] border border-gray-800 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer w-32"><option value="telegram">Telegram</option><option value="discord">Discord</option><option value="steam">Steam URL</option><option value="vk">VK</option></select>
                <input type="text" required value={link.value} placeholder="@username или ссылка" onChange={(e) => updateSocialField(index, 'value', e.target.value)} className="flex-1 bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange" />
                <button type="button" onClick={() => removeSocialField(index)} className="text-gray-500 hover:text-red-500 text-sm px-2">✕</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-csorange text-white font-bold py-2.5 px-4 rounded mt-4 hover:bg-opacity-90 uppercase tracking-wider text-sm">Сохранить изменения</button>
      </form>
    </div>
  );
};
