import { useMemo } from 'react'
import { Icon, type IconName } from './Icon'
import type { Kb, Note } from '../lib/types'
import type { Hit, SearchIndex } from '../lib/search'
import { ASSISTANT_CHAT_LABEL } from '../lib/answer'

type Props = {
  kb: Kb
  index: SearchIndex
  query: string
  onQuery: (value: string) => void
  expanded: Record<string, boolean>
  onToggle: (key: string) => void
  activeNoteId: string | null
  inChat: boolean
  onOpenNote: (id: string) => void
  onOpenChat: () => void
}

export function Sidebar({
  kb, index, query, onQuery, expanded, onToggle, activeNoteId, inChat, onOpenNote, onOpenChat,
}: Props) {
  const results = useMemo<Hit[]>(
    () => (query.trim().length >= 2 ? index.search(query, 40) : []),
    [query, index],
  )
  const searching = query.trim().length >= 2

  return (
    <>
      <button
        type="button"
        className="assistant-card"
        aria-current={inChat}
        onClick={onOpenChat}
      >
        <span className="avatar">
          <Icon name="bot" size={16} />
          <span className="avatar__dot" />
        </span>
        <span>
          <span className="assistant-card__name">{ASSISTANT_CHAT_LABEL}</span>
          <br />
          <span className="assistant-card__hint">вопросы по базе знаний</span>
        </span>
      </button>

      <div className="search">
        <span className="search__icon"><Icon name="search" size={15} /></span>
        <input
          className="search__input"
          type="search"
          value={query}
          placeholder="Поиск по базе"
          aria-label="Поиск по базе знаний"
          onChange={(e) => onQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="btn btn--icon search__clear"
            aria-label="Очистить поиск"
            onClick={() => onQuery('')}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <nav className="nav scroll" aria-label="Разделы базы знаний">
        {searching ? (
          results.length ? (
            <ul className="nav__items">
              {results.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    className="nav__item"
                    aria-current={hit.id === activeNoteId}
                    onClick={() => onOpenNote(hit.id)}
                  >
                    <span className="nav__bullet" />
                    <span>
                      {hit.note.title}
                      <br />
                      <span className="nav__count">{sectionTitle(kb, hit.note.section)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nav__empty">
              Ничего не нашлось по запросу «{query.trim()}». Попробуйте другое слово
              или задайте вопрос в чате.
            </p>
          )
        ) : (
          kb.sections.map((section) => {
            const open = expanded[section.key] ?? false
            return (
              <div className="nav__group" key={section.key}>
                <button
                  type="button"
                  className="nav__groupBtn"
                  aria-expanded={open}
                  onClick={() => onToggle(section.key)}
                >
                  <span className="nav__groupIcon"><Icon name={section.icon as IconName} size={15} /></span>
                  <span className="nav__groupLabel">{section.title}</span>
                  <span className="nav__count">{section.count}</span>
                  <span className="nav__chevron"><Icon name="chevron" size={14} /></span>
                </button>

                {open && (
                  <ul className="nav__items enter">
                    {section.groups.map((group) => (
                      <li key={group.title}>
                        {section.groups.length > 1 && (
                          <div className="nav__subgroup">{group.title}</div>
                        )}
                        <ul className="nav__items nav__items--nested">
                          {group.notes.map((id) => {
                            const note: Note = kb.notes[id]
                            return (
                              <li key={id}>
                                <button
                                  type="button"
                                  className="nav__item"
                                  aria-current={id === activeNoteId}
                                  onClick={() => onOpenNote(id)}
                                >
                                  <span className="nav__bullet" />
                                  <span>{note.title}</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })
        )}
      </nav>
    </>
  )
}

function sectionTitle(kb: Kb, key: string): string {
  return kb.sections.find((s) => s.key === key)?.title ?? key
}
