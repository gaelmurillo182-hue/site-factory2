import { Link } from 'react-router-dom'
import { contacts } from '../data/site'

/**
 * Короткая полоса «спросить» вместо полной формы.
 *
 * Раньше форма запроса стояла на каждой из 19 страниц позиций, на страницах
 * направлений и ещё в четырёх местах — двадцать шесть одинаковых тяжёлых
 * блоков на сайт. Каждый добавлял полторы тысячи пикселей вертикали и тёмную
 * полосу в конце светлой страницы.
 *
 * Полная форма осталась там, где человек уже решил писать: на «Контактах»
 * и на странице «По чертежу». Везде остальном — одна строка с телефоном
 * и ссылкой.
 */
export default function CtaBand({ what }: { what?: string }) {
  return (
    <aside className="lv-cta">
      <div className="lv-wrap lv-cta__row">
        <p className="lv-cta__text">
          {what ? (
            <>
              Нужен расчёт по позиции «{what}»? Пришлите чертёж или опишите узел — ответим
              маркой сплава, допуском, сроком и ценой.
            </>
          ) : (
            <>
              Пришлите чертёж или опишите узел — ответим маркой сплава, допуском, сроком
              и ценой.
            </>
          )}
        </p>
        <div className="lv-cta__actions">
          <Link className="lv-btn lv-btn--primary" to="/po-chertezhu#zapros">
            Запросить расчёт
          </Link>
          <a className="lv-cta__phone" href={`tel:${contacts.phoneOffice.tel}`}>
            {contacts.phoneOffice.human}
          </a>
        </div>
      </div>
    </aside>
  )
}
