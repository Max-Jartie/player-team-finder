import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Импортируем хук

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Забираем метод login из контекста

  const [isRegister, setIsRegister] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister && password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    // Имитируем успешный ответ бэкенда с выдачей JWT токена
    const mockToken = "fake-jwt-token-from-fastapi";
    
    // Вызываем глобальный login
    login(mockToken, email);
    
    alert(isRegister ? "Успешная регистрация!" : "Успешный вход!");
    navigate('/profile'); // Перенаправляем в личный кабинет
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-csdark p-8 rounded-lg border border-gray-800 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {isRegister ? 'Создать аккаунт' : 'Вход в систему'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Электронная почта
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-csorange transition-colors"
            />
          </div>

          {/* Поле Пароль */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-csorange transition-colors"
            />
          </div>

          {/* Второе поле пароля (только для регистрации) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Повторите пароль
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#12161a] border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-csorange transition-colors"
              />
            </div>
          )}

          {/* Кнопка отправки */}
          <button
            type="submit"
            className="w-full bg-csorange text-white font-bold py-2.5 px-4 rounded mt-2 hover:bg-opacity-90 transition-colors uppercase tracking-wider text-sm"
          >
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        {/* Переключатель режимов под формой */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {isRegister ? (
            <p>
              Уже есть аккаунт?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-csorange hover:underline font-medium focus:outline-none"
              >
                Войдите.
              </button>
            </p>
          ) : (
            <p>
              Нет аккаунта?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-csorange hover:underline font-medium focus:outline-none"
              >
                Зарегистрируйтесь.
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
