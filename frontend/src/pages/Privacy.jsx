import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingFooter } from '../components/landing/LandingFooter';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingHeader />
      <main>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
          <p>
            Настоящая политика конфиденциальности описывает, какие данные собирает и как обрабатывает
            их сервис Дош-ло. Используя сервис, вы соглашаетесь с условиями, описанными ниже.
          </p>

          <h2 className="text-xl font-semibold">1. Какие данные мы собираем</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Данные учетной записи: имя, email, телефон.</li>
            <li>Данные учебного процесса: список учеников, предметы, расписание, оплаты.</li>
            <li>Технические данные: IP-адрес, тип устройства, информация о браузере.</li>
          </ul>

          <h2 className="text-xl font-semibold">2. Цели обработки</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Предоставление функций CRM и работы личного кабинета.</li>
            <li>Поддержка пользователей и улучшение качества сервиса.</li>
            <li>Обеспечение безопасности и предотвращение злоупотреблений.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Передача данных третьим лицам</h2>
          <p>
            Мы не передаем персональные данные третьим лицам, за исключением случаев, предусмотренных
            законом или необходимых для работы сервиса (например, обработка платежей за подписку).
          </p>

          <h2 className="text-xl font-semibold">4. Хранение и защита данных</h2>
          <p>
            Мы используем технические и организационные меры защиты, чтобы обеспечить безопасность
            данных и предотвратить несанкционированный доступ.
          </p>

          <h2 className="text-xl font-semibold">5. Важное уточнение о платежах</h2>
          <p>
            Дош-ло не принимает оплату между репетитором и учеником. Платежи в сервисе относятся
            только к оплате использования CRM, если выбран платный тариф.
          </p>

          <h2 className="text-xl font-semibold">6. Контакты</h2>
          <p>
            По вопросам конфиденциальности пишите на <a className="text-blue-600" href="mailto:info@dosh-lo.ru">info@dosh-lo.ru</a>.
            Поддержка в Telegram: <a className="text-blue-600" href="https://t.me/Orson_Krenni">t.me/Orson_Krenni</a>.
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Privacy;
