import { Link } from 'react-router-dom';
import { Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { LandingCard } from './LandingCard';
import { landingButtonClasses } from './LandingButton';

const aiFeatures = [
  'Создание задач по любому предмету',
  'Адаптация под уровень ученика',
  'Генерация тестов и контрольных',
  'Уникальный контент каждый раз',
];

export const LandingAIShowcase = () => {
  return (
    <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-20 blur-2xl"></div>
            <img
              src="https://images.unsplash.com/photo-1618758992242-2d4bc63a1be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYWl8ZW58MXx8fHwxNzY5MDcwODI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="AI технология"
              className="relative rounded-3xl shadow-2xl w-full object-cover h-[420px] sm:h-[500px]"
            />

            <LandingCard className="absolute bottom-8 right-6 sm:right-8 p-4 bg-white/95 backdrop-blur shadow-xl border-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Задание создано!</p>
                  <p className="text-xs text-gray-600">За 3 секунды</p>
                </div>
              </div>
            </LandingCard>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by ChatGPT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              AI-генератор домашних заданий
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Интеграция с OpenAI API позволяет создавать уникальные учебные материалы
              за секунды. Просто укажите тему, уровень сложности и получите готовое задание.
            </p>

            <div className="space-y-3">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <LandingCard className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Экономьте до 10 часов в неделю</h4>
                  <p className="text-sm text-gray-600">
                    Автоматизируйте создание заданий и сосредоточьтесь на преподавании
                  </p>
                </div>
              </div>
            </LandingCard>

            <Link
              to="/register"
              className={landingButtonClasses({
                size: 'lg',
                className:
                  'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8',
              })}
            >
              Попробовать AI-генератор
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
