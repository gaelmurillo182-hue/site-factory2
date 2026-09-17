import Reveal from './motion/Reveal'

const NUMBERS = [
  {
    value: '1000 ₽',
    what: 'Выезд и замер по городу',
    cond: 'Засчитывается в стоимость заказа, если работы заказываете нам',
  },
  {
    value: 'от 1500 ₽',
    what: 'Сервисный выезд',
    cond: 'Диагностика системы, поиск и устранение неисправности',
  },
  {
    value: 'входит',
    what: 'Настройка удалённого просмотра',
    cond: 'Одно устройство настраиваем без доплаты при пусконаладке',
  },
]

export default function Money() {
  return (
    <section className="section section--surface" id="money" aria-labelledby="money-title">
      <div className="container">
        <div className="money__head">
          <h2 className="h2" id="money-title">
            Что стоит денег и как мы их берём
          </h2>
          <p className="text text--primary money__lead">
            Прайса на сайте нет, и это не приём для того, чтобы заставить вас позвонить.
            Комплектов с фиксированной ценой мы не собирали: одна и та же задача на
            панельном доме и на срубе с чердаком отличается по работам вдвое. Публиковать
            цифру, к которой придётся добавлять «но у вас случай особый», мы не хотим.
            Ниже — три суммы, которые известны заранее и не меняются.
          </p>
        </div>

        <div className="money__numbers">
          {NUMBERS.map((n, i) => (
            <Reveal className="plate" key={n.what} delay={i * 0.07}>
              <span className="plate__value num">{n.value}</span>
              <span className="plate__what">{n.what}</span>
              <span className="plate__cond">{n.cond}</span>
            </Reveal>
          ))}
        </div>

        <div className="money__cols">
          <div className="money__col">
            <h3 className="h4">Как платить</h3>
            <ul className="ruled">
              <li>Наличными.</li>
              <li>Безналичным расчётом. Работаем без НДС.</li>
              <li>
                Оборудование и расходные материалы — предоплатой: мы закупаем их под ваш
                объект и под согласованный состав.
              </li>
            </ul>
          </div>

          <div className="money__col">
            <h3 className="h4">Документы для юрлиц</h3>
            <p className="text">
              Договор с составом работ и сроками. Закрывающие документы после сдачи
              объекта. Если для тендера или для арендодателя нужен конкретный комплект
              бумаг — скажите об этом до подписания, подготовим вместе со сметой.
            </p>
          </div>

          <div className="money__col">
            <h3 className="h4">Оборудование без монтажа</h3>
            <p className="text">
              Продаём и просто оборудование, если ставить будете сами или своими силами.
              Поможем подобрать модели под задачу, чтобы связка камера — регистратор —
              коммутатор действительно заработала вместе.
            </p>
          </div>

          <div className="money__col">
            <h3 className="h4">Гарантия</h3>
            <p className="text">
              На оборудование действует гарантийный срок производителя. Замену по гарантии
              оформляем сами.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
