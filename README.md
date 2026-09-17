# Site Factory

Локальная студия по производству сайтов на Claude Code:
редизайн существующих и создание с нуля.

## Быстрый старт

```bash
# 1. Проверить окружение
node -v          # нужен 20 LTS+
claude --version # нужен Claude Code

# 2. Поставить скиллы
bash setup.sh              # macOS / Linux
.\setup.ps1                # Windows PowerShell

# 3. Запустить ИЗ ЭТОЙ ПАПКИ
claude
```

Внутри Claude Code проверьте, что всё подхватилось:

```
/agents    → 6 агентов
/mcp       → playwright: connected
/help      → /brief, /new-site, /redesign, /polish
```

## Первый сайт

```
/brief
```
Ответьте на вопросы → появится `brief/<имя>.md`

```
/new-site brief/<имя>.md
```

Дальше агенты ведут вас по пайплайну с двумя остановками на ваше решение.

## Документация

| Файл | О чём |
|---|---|
| `docs/01-УСТАНОВКА.md` | пошаговая установка, что проверено и что нет |
| `docs/02-РЕПОЗИТОРИИ.md` | все репозитории с проверкой на существование |
| `docs/03-ПРОМПТЫ.md` | библиотека промптов под каждый этап |
| `docs/04-WORKFLOW.md` | как устроен пайплайн и почему именно так |

## Состав

**6 субагентов** (`.claude/agents/`)
brief-analyst · art-director · copywriter · frontend-builder · motion-engineer · visual-qa

**4 команды** (`.claude/commands/`)
`/brief` · `/new-site` · `/redesign` · `/polish`

**Правила проекта** — `CLAUDE.md`. Claude Code читает его автоматически при
каждом запуске из этой папки. Там запреты на шрифты по умолчанию, фиолетовые
градиенты и выдуманные факты.

## Главное

Без **Playwright MCP** вся конструкция работает вслепую. Это единственный
компонент, который нельзя пропустить:

```bash
claude mcp add playwright -s user -- npx @playwright/mcp@latest
```
