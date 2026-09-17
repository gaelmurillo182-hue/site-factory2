export type NoteMeta = {
  complexity: number | null
  rf_available: string | null
  price_from: number | null
  price_to: number | null
  pricing_model: string | null
  level: string | null
  hours: number | null
  term: string | null
  sizes: string | null
  cycle: string | null
  funnel_stage: string | null
  verified_at: string | null
}

export type Note = {
  id: string
  title: string
  name: string
  section: string
  group: string
  order: number
  tags: string[]
  status: string
  meta: NoteMeta
  body: string
  text: string
  headings: { level: number; text: string }[]
  links: string[]
  backlinks: string[]
}

export type SectionGroup = { title: string; notes: string[] }

export type Section = {
  key: string
  title: string
  icon: string
  subtitle: string
  count: number
  groups: SectionGroup[]
}

export type Kb = {
  generatedAt: string
  counts: { notes: number; sections: number; links: number }
  sections: Section[]
  notes: Record<string, Note>
}

export type Message = {
  role: 'user' | 'assistant'
  text: string
  /** id заметок-источников — ассистент отвечает только по ним */
  sources?: string[]
  /** true, если в базе ничего не нашлось */
  empty?: boolean
  vote?: 'up' | 'down' | null
}

export type Conversation = {
  id: string
  title: string
  createdAt: number
  messages: Message[]
}
