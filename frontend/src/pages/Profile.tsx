import React from 'react';

export const Profile: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-csdark rounded-lg border border-gray-800 mt-10">
      <h2 className="text-2xl font-bold text-csorange mb-6">Личный кабинет</h2>
      <p className="text-gray-400">Здесь будут настраиваться ваши данные: Ник, Возраст, Пол, Соцсети.</p>
    </div>
  );
};
