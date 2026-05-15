import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatGamerDate } from '../services/formatDate';


export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Временная заглушка данных игрока (в будущем тут будет фоновый запрос api.get(`/applications/${id}`))
  const player = {
    id: 1,
    nickname: 'RedBull',
    game: 'cs2',
    gender: 'Мужской',
    age: '28 лет',
    country: 'Россия',
    updatedAt: '2026-05-14T20:53:00.000Z',
    lastVisit: '2026-05-15T18:30:00.000Z',
    socialLinks: [
      { type: 'telegram', value: '@redbull_cs' },
      { type: 'discord', value: 'redbull#1111' }
    ],
    description: 'Ищу пати, только онли на карты Cache и Office. Для еженедельного дропа, 3-4 катки в неделю. От вас связь.'
  };


  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-csdark rounded-lg border border-gray-800 shadow-2xl">
      {/* Кнопка возврата */}
      <button 
        onClick={() => window.history.back()} 
        className="text-sm text-gray-500 hover:text-csorange transition-colors mb-6 block cursor-pointer"
      >
        ← Вернуться к списку заявок
      </button>

      {/* БЛОК 1: ОБЩАЯ ИНФОРМАЦИЯ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-400 border-b border-gray-800 pb-2 mb-4 tracking-wide uppercase text-sm">
          Общая информация
        </h2>
        
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 py-1">
            <span className="text-gray-500">Никнейм</span>
            <span className="col-span-2 font-bold text-csorange text-base">{player.nickname}</span>
          </div>

          <div className="grid grid-cols-3 py-1">
            <span className="text-gray-500">Пол</span>
            <span className="col-span-2 text-gray-200">{player.gender}</span>
          </div>

          <div className="grid grid-cols-3 py-1">
            <span className="text-gray-500">Возраст</span>
            <span className="col-span-2 text-gray-200">{player.age}</span>
          </div>

          <div className="grid grid-cols-3 py-1 items-center">
            <span className="text-gray-500">Страна</span>
            <span className="col-span-2 text-gray-200 flex items-center gap-2">
              <span>🇷🇺</span> 
              <span>{player.country}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 py-1 border-t border-gray-900 pt-3">
            <span className="text-gray-500">Обновлена</span>
            <span className="col-span-2 text-gray-400">{formatGamerDate(player.updatedAt)}</span>
          </div>
          <div className="grid grid-cols-3 py-1">
              <span className="text-gray-500">Последний визит</span>
              <span className="col-span-2 text-gray-400">{formatGamerDate(player.lastVisit)}</span>
          </div>
        </div>
      </section>

      {/* БЛОК 2: ДОПОЛНИТЕЛЬНОЕ ОПИСАНИЕ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-400 border-b border-gray-800 pb-2 mb-4 tracking-wide uppercase text-sm">
          Дополнительное описание
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#12161a] p-4 rounded border border-gray-900">
          {player.description}
        </p>
      </section>

      {/* БЛОК 3: КОНТАКТЫ ДЛЯ СВЯЗИ */}
      <section>
        <h2 className="text-xl font-bold text-gray-400 border-b border-gray-800 pb-2 mb-4 tracking-wide uppercase text-sm">
          Контакты для связи
        </h2>
        <div className="flex flex-wrap gap-3">
          {player.socialLinks.map((link, idx) => (
            <div 
              key={idx} 
              className="bg-[#12161a] border border-gray-800 px-4 py-2 rounded text-xs flex items-center gap-2"
            >
              <span className="text-csorange uppercase font-bold">{link.type}:</span>
              <span className="text-gray-200 font-medium">{link.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
