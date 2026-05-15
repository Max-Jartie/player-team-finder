import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SocialLink {
  id: string;
  type: string;
  value: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  //СОСТОЯНИЕ ФОРМЫ ЮЗЕРА
  const [nickname, setNickname] = useState<string>('Spawn');
  const [age, setAge] = useState<string>('22');
  const [gender, setGender] = useState<string>('male');
  const [country, setCountry] = useState<string>('RU');
  
  // Динамический список соцсетей
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', type: 'telegram', value: '@spawn_cs' },
    { id: '2', type: 'discord', value: 'spawn#1337' }
  ]);

  // Управление динамическими полями соцсетей
  const addSocialField = () => {
    const newField: SocialLink = { id: Date.now().toString(), type: 'telegram', value: '' };
    setSocialLinks([...socialLinks, newField]);
  };

  const removeSocialField = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const updateSocialField = (id: string, key: 'type' | 'value', val: string) => {
    setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, [key]: val } : link));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Сохранение профиля в БД:', { nickname, age, gender, country, socialLinks });
    alert('Профиль успешно сохранен (симуляция)');
  };

  //ОТОБРАЖЕНИЕ ДЛЯ ГОСТЯ
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-csdark rounded-lg border border-gray-800 text-center shadow-xl">

        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Чтобы просматривать и редактировать личный кабинет, необходимо войти в свой аккаунт или зарегистрироваться.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-csorange text-black font-bold py-2.5 px-6 rounded uppercase tracking-wider text-sm hover:bg-opacity-90 transition-colors w-full"
        >
          Перейти к авторизации
        </button>
      </div>
    );
  }

  //ОТОБРАЖЕНИЕ ДЛЯ ПОЛЬЗОВАТЕЛЯ
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-csdark rounded-lg border border-gray-800 shadow-xl relative">

      <h2 className="text-2xl font-bold text-csorange mb-2 uppercase tracking-wide">Личный кабинет</h2>
      <p className="text-gray-400 text-xs mb-6">Информация ниже будет использоваться для автозаполнения ваших заявок.</p>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Никнейм */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Игровой никнейм</label>
          <input
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors"
          />
        </div>

        {/* Возраст, Пол, Страна в одну строку */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Возраст</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Пол</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors cursor-pointer"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Страна</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors cursor-pointer"
            >
              <option value="RU">Россия (RU)</option>
              <option value="BY">Беларусь (BY)</option>
              <option value="KZ">Казахстан (KZ)</option>
              <option value="UA">Украина (UA)</option>
            </select>
          </div>
        </div>

        {/* Динамический блок соцсетей */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Контакты / Соцсети</label>
            <button
              type="button"
              onClick={addSocialField}
              className="text-xs bg-gray-800 text-csorange px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              + Добавить ссылку
            </button>
          </div>

          <div className="space-y-3">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex gap-3 items-center">
                <select
                  value={link.type}
                  onChange={(e) => updateSocialField(link.id, 'type', e.target.value)}
                  className="bg-[#12161a] border border-gray-800 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-csorange cursor-pointer w-32"
                >
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="steam">Steam URL</option>
                  <option value="vk">VK</option>
                </select>

                <input
                  type="text"
                  required
                  value={link.value}
                  placeholder="@username или ссылка"
                  onChange={(e) => updateSocialField(link.id, 'value', e.target.value)}
                  className="flex-1 bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-csorange transition-colors"
                />

                <button
                  type="button"
                  onClick={() => removeSocialField(link.id)}
                  className="text-gray-500 hover:text-red-500 text-sm px-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка отправки формы */}
        <button
          type="submit"
          className="w-full bg-csorange text-black font-bold py-2.5 px-4 rounded mt-4 hover:bg-opacity-90 transition-colors uppercase tracking-wider text-sm"
        >
          Сохранить изменения
        </button>
      </form>
    </div>
  );
};
