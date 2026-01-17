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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {format(weekStart, 'd MMMM', { locale: ru })} -{' '}
          {format(weekEnd, 'd MMMM yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-4 py-2 hover:bg-gray-100 rounded-lg font-medium"
          >
            Сегодня
          </button>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
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
              className={`border rounded-lg p-3 min-h-[120px] cursor-pointer hover:bg-gray-50 ${
                isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className="font-semibold mb-2">
                <div className="text-xs text-gray-500 uppercase">
                  {format(day, 'EEEEEE', { locale: ru })}
                </div>
                <div className={isToday ? 'text-primary-600' : ''}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {dayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick(lesson);
                    }}
                    className={`text-xs p-2 rounded border ${getPaymentStatusColor(
                      lesson.payment_status
                    )}`}
                  >
                    <div className="font-medium truncate">
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
