import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ lessons, onDayClick, onLessonClick, currentMonth, onMonthChange }) => {
  const [internalMonth, setInternalMonth] = useState(new Date());
  const activeMonth = currentMonth ?? internalMonth;
  const setMonth = onMonthChange ?? setInternalMonth;

  const monthStart = startOfMonth(activeMonth);
  const monthEnd = endOfMonth(activeMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ru, weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { locale: ru, weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 capitalize">
          {format(activeMonth, 'LLLL yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setMonth(subMonths(activeMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-400 transition-colors"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium text-sm text-gray-700 dark:text-slate-300 transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={() => setMonth(addMonths(activeMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-400 transition-colors"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Calendar - Month Grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayLessons = getLessonsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, activeMonth);

            return (
              <div
                key={day.toISOString()}
                className={`border rounded-lg p-1.5 lg:p-2 min-h-[80px] lg:min-h-[100px] cursor-pointer transition-colors ${
                  isToday
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                    : isCurrentMonth
                    ? 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50'
                }`}
                onClick={() => onDayClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'text-primary-600 dark:text-primary-400'
                    : isCurrentMonth
                    ? 'text-gray-900 dark:text-slate-100'
                    : 'text-gray-400 dark:text-slate-600'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayLessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonClick(lesson);
                      }}
                      className={`text-xs p-1 rounded border truncate ${getPaymentStatusColor(
                        lesson.payment_status
                      )} transition-colors hover:opacity-80`}
                    >
                      {format(new Date(lesson.datetime_start), 'HH:mm')}
                    </div>
                  ))}
                  {dayLessons.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-slate-500 pl-1">
                      +{dayLessons.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Calendar - Compact Month View */}
      <div className="md:hidden">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-slate-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0.5 mb-0.5">
            {week.map((day) => {
              const dayLessons = getLessonsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, activeMonth);

              return (
                <div
                  key={day.toISOString()}
                  className={`relative p-1 min-h-[44px] rounded cursor-pointer transition-colors ${
                    isToday
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : isCurrentMonth
                      ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                      : 'bg-gray-50 dark:bg-slate-900'
                  }`}
                  onClick={() => onDayClick(day)}
                >
                  <div className={`text-xs text-center font-medium ${
                    isToday
                      ? 'text-primary-600 dark:text-primary-400'
                      : isCurrentMonth
                      ? 'text-gray-900 dark:text-slate-100'
                      : 'text-gray-400 dark:text-slate-600'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {dayLessons.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                      {dayLessons.slice(0, 3).map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            lesson.payment_status === 'paid'
                              ? 'bg-green-500'
                              : lesson.payment_status === 'partial'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                      ))}
                      {dayLessons.length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
