import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ lessons, onDayClick, onLessonClick, onWeekChange }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { locale: ru, weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { locale: ru, weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Notify parent when week changes to reload data
  useEffect(() => {
    if (onWeekChange) {
      onWeekChange(weekStart, weekEnd);
    }
  }, [currentWeek]);

  const getLessonsForDay = (day) => {
    return lessons.filter((lesson) =>
      isSameDay(new Date(lesson.datetime_start), day)
    );
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'unpaid':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'partial':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(weekStart, 'd MMMM', { locale: ru })} -{' '}
          {format(weekEnd, 'd MMMM yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-6 py-3 hover:bg-gray-100 rounded-lg font-bold text-base transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const dayLessons = getLessonsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`border-2 rounded-xl p-4 min-h-[150px] cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className="font-bold mb-3">
                <div className="text-sm text-gray-600 uppercase font-semibold">
                  {format(day, 'EEEEEE', { locale: ru })}
                </div>
                <div className={`text-xl ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-2">
                {dayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick(lesson);
                    }}
                    className={`text-sm p-2 rounded-lg border-2 font-medium ${getPaymentStatusColor(
                      lesson.payment_status
                    )} cursor-pointer hover:shadow-sm transition-all`}
                  >
                    <div className="truncate">
                      {format(new Date(lesson.datetime_start), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
