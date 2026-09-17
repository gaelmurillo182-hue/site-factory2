#!/usr/bin/env bash
# Site Factory — установка базового набора скиллов (macOS / Linux)
# Запускать из корня site-factory:  bash setup.sh
set -e

echo "=== Проверка окружения ==="
command -v node >/dev/null 2>&1 || { echo "Нет Node.js. Поставьте Node 20 LTS+"; exit 1; }
command -v git  >/dev/null 2>&1 || { echo "Нет Git."; exit 1; }
echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
echo "Git:  $(git --version)"
echo

echo "=== Базовый набор скиллов (4 слоя) ==="
npx -y skills add anthropics/skills --skill frontend-design
npx -y skills add anthropics/skills --skill theme-factory
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx -y skills add https://github.com/delphi-ai/animate-skill --skill animate
echo

echo "=== Скиллы для редизайна ==="
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "image-to-code"
npx -y skills add zanwei/design-dna
echo

echo "=== Анимация (опционально, комментируйте если не нужно) ==="
npx -y skills add https://github.com/greensock/gsap-skills
npx -y skills add LottieFiles/motion-design-skill
npx -y skills add kylezantos/design-motion-principles
echo

echo "=== Playwright MCP — глаза агента ==="
if command -v claude >/dev/null 2>&1; then
  claude mcp add playwright -s user -- npx @playwright/mcp@latest || \
    echo "Не удалось добавить автоматически. Добавьте вручную (см. docs/01-УСТАНОВКА.md)."
else
  echo "Claude Code не найден. Поставьте: npm install -g @anthropic-ai/claude-code"
fi
echo

echo "=== Готово ==="
echo "Дальше вручную, ВНУТРИ claude:"
echo "  /plugin marketplace add anthropics/skills"
echo "  /plugin install example-skills@anthropic-agent-skills"
echo "  /plugin marketplace add AThevon/genjutsu"
echo "  /plugin install genjutsu"
echo
echo "Impeccable (опционально):  npx impeccable install  →  /impeccable init"
