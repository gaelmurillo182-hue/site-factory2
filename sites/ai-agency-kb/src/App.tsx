import { useCallback, useEffect, useMemo, useState } from 'react'
import kbData from './data/kb.json'
import type { Conversation, Kb, Message } from './lib/types'
import { SearchIndex } from './lib/search'
import { buildAnswer, titleFrom } from './lib/answer'
import { load, newId, save } from './lib/storage'
import { Icon, type IconName } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import { ConversationList } from './components/ConversationList'
import { ChatPanel } from './components/ChatPanel'
import { ArticleView } from './components/ArticleView'

const kb = kbData as unknown as Kb

type View = { kind: 'chat' } | { kind: 'note'; id: string }
type Pane = 'nav' | 'list' | 'main'
type Theme = 'dark' | 'light'

export default function App() {
  const index = useMemo(() => new SearchIndex(kb), [])

  const resolve = useMemo(() => {
    const map = new Map<string, string>()
    for (const note of Object.values(kb.notes)) {
      map.set(note.name, note.id)
      map.set(note.title, note.id)
    }
    return (target: string) => map.get(target.trim()) ?? null
  }, [])

  // Ручка для отладки ранжирования из консоли и из QA-скриптов:
  // __kb.index.search('запрос') отдаёт список с оценками.
  // Инструмент внутренний и офлайновый — наружу отсюда ничего не уходит.
  ;(window as unknown as { __kb: unknown }).__kb = { index, kb }

  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>({ kind: 'chat' })
  const [pane, setPane] = useState<Pane>('main')
  const [thinking, setThinking] = useState(false)

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    load('expanded', { '01-Автоматизации': true } as Record<string, boolean>),
  )
  const [conversations, setConversations] = useState<Conversation[]>(() => load('conversations', [] as Conversation[]))
  const [activeId, setActiveId] = useState<string | null>(() => load('activeConversation', null as string | null))
  const [theme, setTheme] = useState<Theme>(() => load('theme', 'dark' as Theme))

  useEffect(() => save('expanded', expanded), [expanded])
  useEffect(() => save('conversations', conversations), [conversations])
  useEffect(() => save('activeConversation', activeId), [activeId])
  useEffect(() => {
    save('theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const active = conversations.find((c) => c.id === activeId) ?? null

  const openNote = useCallback((id: string) => {
    if (!kb.notes[id]) return
    setView({ kind: 'note', id })
    setPane('main')
  }, [])

  const openChat = useCallback(() => {
    setView({ kind: 'chat' })
    setPane('main')
  }, [])

  const newConversation = useCallback(() => {
    setActiveId(null)
    setView({ kind: 'chat' })
    setPane('main')
  }, [])

  const send = useCallback(
    (text: string) => {
      setView({ kind: 'chat' })
      setPane('main')

      // id разговора вычисляется до setState: внутри updater он был бы
      // недоступен снаружи, и setActiveId получал бы устаревшее значение.
      const existing = conversations.find((c) => c.id === activeId) ?? null
      const convoId = existing ? existing.id : newId()
      const question: Message = { role: 'user', text }

      setConversations((prev) =>
        existing
          ? prev.map((c) => (c.id === convoId ? { ...c, messages: [...c.messages, question] } : c))
          : [{ id: convoId, title: titleFrom(text), createdAt: Date.now(), messages: [question] }, ...prev],
      )
      setActiveId(convoId)
      setThinking(true)

      // Ответ собирается локально и мгновенно. Небольшая пауза — чтобы
      // появление ответа читалось как ответ, а не как мигание интерфейса.
      window.setTimeout(() => {
        const answer = buildAnswer(text, index, kb)
        setConversations((prev) =>
          prev.map((c) => (c.id === convoId ? { ...c, messages: [...c.messages, answer] } : c)),
        )
        setThinking(false)
      }, 260)
    },
    [activeId, conversations, index],
  )

  const vote = useCallback(
    (messageIndex: number, value: 'up' | 'down') => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m, i) =>
                  i === messageIndex ? { ...m, vote: m.vote === value ? null : value } : m,
                ),
              }
            : c,
        ),
      )
    },
    [activeId],
  )

  const toggleSection = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const note = view.kind === 'note' ? kb.notes[view.id] : null
  const section = note ? kb.sections.find((s) => s.key === note.section) : null

  const headerIcon: IconName = (section?.icon as IconName) ?? 'brain'
  const headerTitle = section ? section.title : 'База знаний агентства'
  const headerSubtitle = section
    ? section.subtitle
    : `${kb.counts.notes} заметок, ${kb.counts.links} связей. Поиск и ассистент работают локально — данные никуда не уходят.`

  return (
    <div className="app">
      <header className="page-header">
        <span className="page-header__icon"><Icon name={headerIcon} size={19} /></span>
        <div className="page-header__text">
          <h1 className="page-header__title">{headerTitle}</h1>
          <p className="page-header__subtitle">{headerSubtitle}</p>
        </div>
        <button
          type="button"
          className="btn btn--icon"
          aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Icon name="theme" size={16} />
        </button>
      </header>

      <div className="mobileBar" role="tablist" aria-label="Панели">
        <button type="button" role="tab" className="btn btn--ghost" aria-pressed={pane === 'nav'} onClick={() => setPane('nav')}>
          <Icon name="menu" size={14} /> Разделы
        </button>
        <button type="button" role="tab" className="btn btn--ghost" aria-pressed={pane === 'list'} onClick={() => setPane('list')}>
          <Icon name="chat" size={14} /> Разговоры
        </button>
        <button type="button" role="tab" className="btn btn--ghost" aria-pressed={pane === 'main'} onClick={() => setPane('main')}>
          <Icon name="book" size={14} /> {view.kind === 'note' ? 'Статья' : 'Чат'}
        </button>
      </div>

      <div className="workspace">
        <aside className="panel" data-mobile-active={pane === 'nav'} aria-label="Навигация">
          <Sidebar
            kb={kb}
            index={index}
            query={query}
            onQuery={setQuery}
            expanded={expanded}
            onToggle={toggleSection}
            activeNoteId={note?.id ?? null}
            inChat={view.kind === 'chat'}
            onOpenNote={openNote}
            onOpenChat={openChat}
          />
        </aside>

        <section className="panel" data-mobile-active={pane === 'list'} aria-label="Разговоры">
          <ConversationList
            conversations={conversations}
            activeId={view.kind === 'chat' ? activeId : null}
            onSelect={(id) => { setActiveId(id); openChat() }}
            onNew={newConversation}
          />
        </section>

        <main className="panel" data-mobile-active={pane === 'main'} aria-label={note ? 'Статья' : 'Чат'}>
          {note ? (
            <ArticleView
              note={note}
              kb={kb}
              resolve={resolve}
              onOpenNote={openNote}
              onBackToChat={openChat}
            />
          ) : (
            <ChatPanel
              conversation={active}
              noteCount={kb.counts.notes}
              thinking={thinking}
              resolve={resolve}
              onOpenNote={openNote}
              onSend={send}
              onVote={vote}
              onNew={newConversation}
            />
          )}
        </main>
      </div>
    </div>
  )
}
