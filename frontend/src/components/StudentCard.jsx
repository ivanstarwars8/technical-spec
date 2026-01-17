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
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{student.name}</h3>
            {student.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Phone className="w-4 h-4" />
                <span>{student.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <BookOpen className="w-4 h-4" />
              <span>{student.subject}</span>
              {student.level && (
                <>
                  <span>•</span>
                  <span className="uppercase text-xs font-medium">
                    {student.level.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {student.telegram_id && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Telegram
          </span>
        )}
      </div>
    </Link>
  );
};

export default StudentCard;
