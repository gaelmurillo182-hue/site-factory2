// Небольшой рендер markdown в React-элементы.
// Не dangerouslySetInnerHTML: [[ссылки]] должны быть кликабельными внутри приложения.
// Поддержано ровно то, что встречается в vault: заголовки, списки, цитаты,
// таблицы, разделители, код, жирный, курсив, ссылки и вики-ссылки.

import { Fragment, type ReactNode } from 'react'

type Props = {
  text: string
  /** имя или заголовок заметки → её id, либо null если такой заметки нет */
  resolve: (target: string) => string | null
  onOpenNote: (id: string) => void
}

const INLINE =
  /(\[\[[^\]]+\]\])|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(`[^`]+`)|(\*[^*\n]+\*)/g

function inline(text: string, resolve: Props['resolve'], onOpenNote: Props['onOpenNote'], keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const token = m[0]
    const key = `${keyBase}-${i++}`

    if (token.startsWith('[[')) {
      const inner = token.slice(2, -2)
      const [rawTarget, alias] = inner.split('|')
      const target = rawTarget.trim()
      const label = (alias ?? target).trim()

      if (/^НУЖНО (ОТ КЛИЕНТА|ПРОВЕРИТЬ)/.test(target)) {
        out.push(<span key={key} className="token--todo">{target}</span>)
      } else {
        const id = resolve(target)
        out.push(
          id ? (
            <button key={key} type="button" className="link--note" onClick={() => onOpenNote(id)}>
              {label}
            </button>
          ) : (
            <span key={key} className="token--todo" title="Заметки с таким именем в базе нет">{label}</span>
          ),
        )
      }
    } else if (token.startsWith('[')) {
      const close = token.indexOf('](')
      const label = token.slice(1, close)
      const href = token.slice(close + 2, -1)
      out.push(
        <a key={key} className="link" href={href} target="_blank" rel="noreferrer noopener">{label}</a>,
      )
    } else if (token.startsWith('**')) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>)
    }
    last = at + token.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function splitRow(line: string): string[] {
  return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim())
}

export function Markdown({ text, resolve, onOpenNote }: Props) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0
  const ink = (s: string) => inline(s, resolve, onOpenNote, `k${key}`)

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    // код
    if (line.startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      nodes.push(<pre key={key++}><code>{buf.join('\n')}</code></pre>)
      continue
    }

    // разделитель
    if (/^---+$/.test(line.trim())) { nodes.push(<hr key={key++} />); i++; continue }

    // заголовок
    const h = /^(#{1,4})\s+(.+)$/.exec(line)
    if (h) {
      const level = h[1].length
      const content = ink(h[2])
      const Tag = (['h1', 'h2', 'h3', 'h4'] as const)[level - 1]
      nodes.push(<Tag key={key++}>{content}</Tag>)
      i++
      continue
    }

    // таблица
    if (line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      const head = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]))
      nodes.push(
        <div className="tableWrap" key={key++}>
          <table>
            <thead>
              <tr>{head.map((c, n) => <th key={n}>{ink(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rn) => (
                <tr key={rn}>{row.map((c, cn) => <td key={cn}>{ink(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // цитата
    if (line.trimStart().startsWith('>')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        buf.push(lines[i].trimStart().replace(/^>\s?/, ''))
        i++
      }
      nodes.push(<blockquote key={key++}>{ink(buf.join(' '))}</blockquote>)
      continue
    }

    // списки
    const bullet = /^\s*[-*]\s+(.*)$/
    const numbered = /^\s*\d+\.\s+(.*)$/
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line)
      const re = ordered ? numbered : bullet
      const items: string[] = []
      while (i < lines.length && re.test(lines[i])) {
        items.push(re.exec(lines[i])![1])
        i++
      }
      const body = items.map((item, n) => {
        const box = /^\[( |x|X)\]\s+(.*)$/.exec(item)
        return (
          <li key={n}>
            {box ? (
              <Fragment>
                <span aria-hidden="true">{box[1].toLowerCase() === 'x' ? '☑ ' : '☐ '}</span>
                {ink(box[2])}
              </Fragment>
            ) : ink(item)}
          </li>
        )
      })
      nodes.push(ordered ? <ol key={key++}>{body}</ol> : <ul key={key++}>{body}</ul>)
      continue
    }

    // абзац
    const buf: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !lines[i].startsWith('```') &&
      !lines[i].trimStart().startsWith('>') &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i]) &&
      !lines[i].trim().startsWith('|') &&
      !/^---+$/.test(lines[i].trim())
    ) {
      buf.push(lines[i])
      i++
    }
    nodes.push(<p key={key++}>{ink(buf.join(' '))}</p>)
  }

  return <div className="prose">{nodes}</div>
}
