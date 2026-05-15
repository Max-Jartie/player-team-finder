export const formatGamerDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
  
    // Обнуляем часы для точного сравнения дней (сегодня/вчера)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
    // Форматируем время (часы и минуты)
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const timeStr = date.toLocaleTimeString('ru-RU', timeOptions);
  
    if (itemDate.getTime() === today.getTime()) {
      return `сегодня в ${timeStr}`;
    } else if (itemDate.getTime() === yesterday.getTime()) {
      return `вчера в ${timeStr}`;
    } else {
      // Если прошло больше 2 дней, выводим стандартную дату (например, 15 мая в 18:30)
      const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
      return `${date.toLocaleDateString('ru-RU', dateOptions)} в ${timeStr}`;
    }
  };
  