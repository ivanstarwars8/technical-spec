import { Link } from 'react-router-dom';
import { User, Phone, BookOpen } from 'lucide-react';

const StudentCard = ({ student }) => {
  return (
    <Link
      to={`/students/${student.id}`}
      className="card hover:shadow-xl transition-all hover:scale-102 cursor-pointer border-2 border-transparent hover:border-blue-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">{student.name}</h3>
            {student.phone && (
              <div className="flex items-center gap-2 text-base text-gray-600 mt-2">
                <Phone className="w-5 h-5" strokeWidth={2} />
                <span className="font-medium">{student.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-base text-gray-700 mt-2">
              <BookOpen className="w-5 h-5 text-blue-600" strokeWidth={2} />
              <span className="font-semibold">{student.subject}</span>
              {student.level && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="uppercase text-sm font-bold text-gray-600">
                    {student.level.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {student.telegram_id && (
          <span className="px-3 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg border-2 border-green-200">
            Telegram
          </span>
        )}
      </div>
    </Link>
  );
};

export default StudentCard;
