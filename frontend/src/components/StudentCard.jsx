import { Link } from 'react-router-dom';
import { User, Phone, BookOpen } from 'lucide-react';

const StudentCard = ({ student }) => {
  return (
    <Link
      to={`/students/${student.id}`}
      className="card hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-slate-100 truncate">{student.name}</h3>
            {student.phone && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-slate-500 mt-1">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{student.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-1 flex-wrap">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{student.subject}</span>
              {student.level && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="uppercase text-xs font-medium">
                    {student.level.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {student.telegram_id && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex-shrink-0 ml-2">
            Telegram
          </span>
        )}
      </div>
    </Link>
  );
};

export default StudentCard;
