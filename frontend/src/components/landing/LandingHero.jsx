import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { landingButtonClasses } from './LandingButton';

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Экономьте до 15 часов в неделю с AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Перестаньте тратить время на рутину. <span className="text-blue-600">Начните зарабатывать больше</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Дош-ло — это не просто CRM. Это ваш AI-ассистент, который берёт на себя составление заданий,
              контроль оплат и расписание, пока вы фокусируетесь на преподавании.
              <span className="block mt-2 font-semibold text-gray-900">
                ⚡ AI создаёт задание за 5 секунд вместо 30 минут
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className={landingButtonClasses({ size: 'lg', className: 'bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg' })}>
                Попробовать бесплатно
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#features" className={landingButtonClasses({ size: 'lg', variant: 'outline', className: 'px-8 py-6 text-lg border-2' })}>
                Смотреть демо
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">15 часов</p>
                <p className="text-sm text-gray-600">Экономия/неделю</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-gray-900">5 секунд</p>
                <p className="text-sm text-gray-600">На создание задания</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-gray-900">+40%</p>
                <p className="text-sm text-gray-600">Рост дохода</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-3xl transform rotate-3 opacity-20"></div>
            <img
              src="https://images.unsplash.com/photo-1561346745-5db62ae43861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwc3R1ZGVudCUyMGxhcHRvcHxlbnwxfHx8fDE3NjkwNzA4MjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Репетитор с учеником"
              className="relative rounded-3xl shadow-2xl w-full object-cover h-[420px] sm:h-[500px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
