import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Markdown } from '../lib/Markdown'
import { ASSISTANT_NAME, ASSISTANT_PLACEHOLDER, ASSISTANT_ROLE } from '../lib/answer'
import type { Conversation, Message } from '../lib/types'

type Props = {
  conversation: Conversation | null
  /** число заметок в базе — берётся из kb.json, а не пишется в текст руками */
  noteCount: number
  thinking: boolean
  resolve: (target: string) => string | null
  onOpenNote: (id: string) => void
  onSend: (text: string) => void
  onVote: (messageIndex: number, vote: 'up' | 'down') => void
  onNew: () => void
}

const SUGGESTIONS = [
  'Сколько стоит бот для клиники',
  'Что отвечать на возражение «дорого»',
  'Кому продавать распознавание первички',
  'Можно ли отправлять персональные данные в зарубежный ИИ',
]

export function ChatPanel({ conversation, noteCount, thinking, resolve, onOpenNote, onSend, onVote, onNew }: Props) {
  const [draft, setDraft] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const messages = conversation?.messages ?? []

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, thinking])

  const submit = () => {
    const text = draft.trim()
    if (!text || thinking) return
    setDraft('')
    onSend(text)
  }

  return (
    <>
      <header className="chat__header">
        <span className="avatar">
          <Icon name="bot" size={16} />
          <span className="avatar__dot" />
        </span>
        <span>
          <span className="chat__name">{ASSISTANT_NAME}</span>
          <br />
          <span className="chat__role">{ASSISTANT_ROLE}</span>
        </span>
        <span className="chat__actions">
          <button type="button" className="btn btn--icon" aria-label="Новый разговор" title="Новый разговор" onClick={onNew}>
            <Icon name="pencil" size={15} />
          </button>
        </span>
      </header>

      <div className="chat__body scroll" ref={bodyRef}>
        {messages.length === 0 && !thinking && (
          <div className="state">
            <p className="state__title">Спрашивайте так, как спросил бы клиент</p>
            <p>
              {ASSISTANT_NAME} ищет по {noteCount} заметкам базы и отвечает фрагментом из них
              со ссылкой на источник. Если ответа в базе нет — так и скажет,
              а не придумает.
            </p>
            <ul className="suggestions">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" className="btn btn--ghost" onClick={() => onSend(s)}>{s}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageView
            key={i}
            message={m}
            index={i}
            resolve={resolve}
            onOpenNote={onOpenNote}
            onVote={onVote}
          />
        ))}

        {thinking && (
          <div className="msg enter">
            <span className="avatar"><Icon name="bot" size={16} /></span>
            <div className="msg__content">
              <span className="thinking">
                <span className="thinking__dot" />
                <span className="thinking__dot" />
                <span className="thinking__dot" />
                ищу в базе
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => { e.preventDefault(); submit() }}
      >
        <label className="sr-only" htmlFor="composer">Вопрос к базе знаний</label>
        <textarea
          id="composer"
          className="composer__input"
          rows={1}
          value={draft}
          placeholder={ASSISTANT_PLACEHOLDER}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
          }}
        />
        <button type="submit" className="composer__send btn" disabled={!draft.trim() || thinking} aria-label="Отправить">
          <Icon name="send" size={17} />
        </button>
      </form>
    </>
  )
}

function MessageView({
  message, index, resolve, onOpenNote, onVote,
}: {
  message: Message
  index: number
  resolve: (t: string) => string | null
  onOpenNote: (id: string) => void
  onVote: (i: number, v: 'up' | 'down') => void
}) {
  if (message.role === 'user') {
    return (
      <div className="msg msg--user enter">
        <div className="msg__bubble">{message.text}</div>
      </div>
    )
  }

  return (
    <div className="msg enter">
      <span className="avatar"><Icon name="bot" size={16} /></span>
      <div className="msg__content">
        <Markdown text={message.text} resolve={resolve} onOpenNote={onOpenNote} />
        <div className="msg__meta">
          <span className="msg__source">
            {message.empty
              ? 'ответа в базе нет'
              : `источников: ${message.sources?.length ?? 0}`}
          </span>
          <button
            type="button"
            className="btn btn--icon"
            aria-label="Ответ полезен"
            aria-pressed={message.vote === 'up'}
            onClick={() => onVote(index, 'up')}
          >
            <Icon name="thumbUp" size={14} />
          </button>
          <button
            type="button"
            className="btn btn--icon"
            aria-label="Ответ не помог"
            aria-pressed={message.vote === 'down'}
            onClick={() => onVote(index, 'down')}
          >
            <Icon name="thumbDown" size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
