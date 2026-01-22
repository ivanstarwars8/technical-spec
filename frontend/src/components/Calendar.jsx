import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ lessons, onDayClick, onLessonClick }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { locale: ru, weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { locale: ru, weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getLessonsForDay = (day) => {
    return lessons.filter((lesson) =>
      isSameDay(new Date(lesson.datetime_start), day)
    );
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400';
      case 'unpaid':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400';
      case 'partial':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
          {format(weekStart, 'd MMMM', { locale: ru })} -{' '}
          {format(weekEnd, 'd MMMM yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-400 transition-colors"
            aria-label="Предыдущая неделя"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium text-sm text-gray-700 dark:text-slate-300 transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-400 transition-colors"
            aria-label="Следующая неделя"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Calendar - 7 columns */}
      <div className="hidden md:grid grid-cols-7 gap-2 lg:gap-4">
        {days.map((day) => {
          const dayLessons = getLessonsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`border rounded-lg p-2 lg:p-3 min-h-[100px] lg:min-h-[120px] cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                isToday 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600' 
                  : 'border-gray-200 dark:border-slate-700'
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className="font-semibold mb-2">
                <div className="text-xs text-gray-500 dark:text-slate-500 uppercase">
                  {format(day, 'EEEEEE', { locale: ru })}
                </div>
                <div className={`text-sm lg:text-base ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-slate-100'}`}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {dayLessons.map((lesson) => {
                  const remaining = lesson.remaining_amount ?? lesson.amount;
                  const remainingText = remaining !== null && remaining !== undefined
                    ? `${parseFloat(remaining).toFixed(0)} ₽`
                    : null;
                  return (
                    <div
                      key={lesson.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonClick(lesson);
                      }}
                      className={`text-xs p-1.5 lg:p-2 rounded border ${getPaymentStatusColor(
                        lesson.payment_status
                      )} transition-colors hover:opacity-80`}
                    >
                      <div className="font-medium truncate">
                        {format(new Date(lesson.datetime_start), 'HH:mm')}
                      </div>
                      {remainingText && (
                        <div className="truncate">{remainingText}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Calendar - List view */}
      <div className="md:hidden space-y-2">
        {days.map((day) => {
          const dayLessons = getLessonsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`border rounded-lg p-3 cursor-pointer ${
                isToday 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600' 
                  : 'border-gray-200 dark:border-slate-700'
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-slate-100'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    {format(day, 'EEEE', { locale: ru })}
                  </div>
                </div>
                {dayLessons.length > 0 && (
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full">
                    {dayLessons.length} занятий
                  </span>
                )}
              </div>
              
              {dayLessons.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {dayLessons.map((lesson) => {
                    const remaining = lesson.remaining_amount ?? lesson.amount;
                    const remainingText = remaining !== null && remaining !== undefined
                      ? `${parseFloat(remaining).toFixed(0)} ₽`
                      : null;
                    return (
                      <div
                        key={lesson.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLessonClick(lesson);
                        }}
                        className={`flex items-center justify-between text-sm p-2 rounded border ${getPaymentStatusColor(
                          lesson.payment_status
                        )}`}
                      >
                        <span className="font-medium">
                          {format(new Date(lesson.datetime_start), 'HH:mm')} - {format(new Date(lesson.datetime_end), 'HH:mm')}
                        </span>
                        {remainingText && (
                          <span className="font-medium">{remainingText}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
