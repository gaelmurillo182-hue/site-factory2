/* Полоса доказательств. Раньше жила внутри Hero и ломала правило
   «максимум 4 текстовых элемента на первом экране». Вынесена отдельно:
   Hero продаёт, эта полоса подтверждает. */

const FACTS = [
  { value: '4,9', label: 'средняя оценка по 458 отзывам' },
  { value: '11', label: 'мастеров, семеро из них топ-мастера' },
  { value: '0 ₽', label: 'LED-наращивание к любому объёму' },
  { value: '2025', label: 'награда DIKIDI AWARDS' },
]

export default function Facts() {
  return (
    <section
      aria-label="Коротко о салоне"
      style={{
        background: 'var(--bg-deep)',
        paddingTop: 'var(--space-6)',
        paddingBottom: 'var(--space-6)',
      }}
    >
      <div
        className="grid grid-cols-2 lg:grid-cols-4"
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
          gap: 'var(--space-5) var(--space-4)',
        }}
      >
        {FACTS.map((fact) => (
          <div key={fact.label} style={{ minWidth: 0 }}>
            <div
              style={
                {
                  fontFamily: 'var(--font-numeric)',
                  fontWeight: 'var(--weight-extrabold)',
                  fontSize: 'var(--text-h3)',
                  color: 'var(--text-accent)',
                  letterSpacing: 'var(--tracking-numeric)',
                  lineHeight: 1,
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties
              }
            >
              {fact.value}
            </div>
            <div
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  maxWidth: '24ch',
                } as React.CSSProperties
              }
            >
              {fact.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
