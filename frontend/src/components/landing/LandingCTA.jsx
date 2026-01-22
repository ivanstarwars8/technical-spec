import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { LandingCard } from './LandingCard';
import { landingButtonClasses } from './LandingButton';

const benefits = ['Без кредитной карты', 'Техподдержка 24/7', '5 учеников бесплатно', '10 AI заданий в месяц'];

export const LandingCTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="max-w-5xl mx-auto">
        <LandingCard className="p-8 sm:p-12 bg-white/10 backdrop-blur-lg border-2 border-white/20 shadow-2xl text-white">
          <div className="text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Начните управлять обучением профессионально
            </h2>

            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Присоединяйтесь к сотням репетиторов, которые уже автоматизировали
              свою работу и увеличили доход
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/register"
                className={landingButtonClasses({
                  size: 'lg',
                  className: 'bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg font-semibold',
                })}
              >
                Начать бесплатно
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="https://t.me/Orson_Krenni"
                className={landingButtonClasses({
                  size: 'lg',
                  variant: 'outline',
                  className: 'border-2 border-white bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg',
                })}
              >
                Поддержка в Telegram
              </a>
            </div>

            <p className="text-sm text-blue-200 pt-4">
              Более 500 репетиторов уже используют нашу платформу ⭐⭐⭐⭐⭐
            </p>
          </div>
        </LandingCard>
      </div>
    </section>
  );
};
