import React from 'react';

export const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-csdark p-8 rounded-lg border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Вход в аккаунт</h2>
        <button className="w-full bg-csorange text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">
          Войти
        </button>
      </div>
    </div>
  );
};
