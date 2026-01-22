import { GraduationCap, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Дош-ло</span>
            </div>
            <p className="text-sm text-gray-400">
              Современная CRM-система для репетиторов с AI-технологиями
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Возможности</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Цены</a></li>
              <li><a href="#ai" className="hover:text-white transition-colors">AI-генератор</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Контакты</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Документация</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Обучение</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Контакты</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Связаться</h4>
            <div className="space-y-3">
              <a href="mailto:info@dosh-lo.ru" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                info@dosh-lo.ru
              </a>
              <a href="https://t.me/Orson_Krenni" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
                Поддержка в Telegram
              </a>
              <div className="flex gap-3 pt-2">
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-400">© 2026 Дош-ло. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Политика конфиденциальности
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
