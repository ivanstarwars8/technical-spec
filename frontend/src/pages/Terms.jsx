import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingFooter } from '../components/landing/LandingFooter';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingHeader />
      <main>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <h1 className="text-3xl font-bold">Условия использования</h1>
          <p>
            Настоящие условия регулируют использование сервиса Дош-ло. Продолжая работу,
            вы принимаете эти условия в полном объеме.
          </p>

          <h2 className="text-xl font-semibold">1. Назначение сервиса</h2>
          <p>
            Дош-ло — это сервис для управления учебным процессом репетитора: учениками,
            расписанием, оплатами и генерацией заданий.
          </p>

          <h2 className="text-xl font-semibold">2. Оплата</h2>
          <p>
            Дош-ло не принимает оплату между репетитором и учеником. Оплата в сервисе взимается
            только за использование CRM при выборе платного тарифа. Бесплатный тариф доступен без оплаты.
          </p>

          <h2 className="text-xl font-semibold">3. Ответственность пользователя</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Пользователь отвечает за корректность данных, которые вводит в систему.</li>
            <li>Пользователь обеспечивает сохранность доступа к своему аккаунту.</li>
            <li>Запрещено использовать сервис для незаконной деятельности.</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Ограничение ответственности</h2>
          <p>
            Сервис предоставляется «как есть». Мы не несем ответственность за прямые или косвенные
            убытки, возникшие в результате использования сервиса, за исключением случаев, предусмотренных законом.
          </p>

          <h2 className="text-xl font-semibold">5. Поддержка</h2>
          <p>
            Связаться с поддержкой можно по email <a className="text-blue-600" href="mailto:info@dosh-lo.ru">info@dosh-lo.ru</a>
            или в Telegram: <a className="text-blue-600" href="https://t.me/Orson_Krenni">t.me/Orson_Krenni</a>.
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Terms;
