import { Icon } from './Icon'
import { plural } from '../lib/storage'
import type { Conversation } from '../lib/types'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew }: Props) {
  return (
    <>
      <button type="button" className="convo__new btn" onClick={onNew}>
        <Icon name="pencil" size={15} />
        Новый разговор
      </button>

      {conversations.length === 0 ? (
        <p className="convo__empty">
          Разговоров пока нет. Спросите что-нибудь — например, «сколько стоит бот
          для клиники» или «что отвечать на возражение дорого».
        </p>
      ) : (
        <ul className="convo__list scroll">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="convo__item btn"
                aria-current={c.id === activeId}
                onClick={() => onSelect(c.id)}
              >
                <span className="convo__title">{c.title}</span>
                <span className="convo__meta">
                  {c.messages.length} {plural(c.messages.length, 'реплика', 'реплики', 'реплик')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
