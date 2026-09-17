# Site Factory — установка базового набора скиллов (Windows PowerShell)
# Запускать из корня site-factory:  .\setup.ps1
$ErrorActionPreference = "Stop"

Write-Host "=== Проверка окружения ===" -ForegroundColor Cyan
node -v; npm -v; git --version
Write-Host ""

Write-Host "=== Базовый набор скиллов (4 слоя) ===" -ForegroundColor Cyan
npx -y skills add anthropics/skills --skill frontend-design
npx -y skills add anthropics/skills --skill theme-factory
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx -y skills add https://github.com/delphi-ai/animate-skill --skill animate
Write-Host ""

Write-Host "=== Скиллы для редизайна ===" -ForegroundColor Cyan
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "image-to-code"
npx -y skills add zanwei/design-dna
Write-Host ""

Write-Host "=== Анимация (опционально) ===" -ForegroundColor Cyan
npx -y skills add https://github.com/greensock/gsap-skills
npx -y skills add LottieFiles/motion-design-skill
npx -y skills add kylezantos/design-motion-principles
Write-Host ""

Write-Host "=== Playwright MCP ===" -ForegroundColor Cyan
claude mcp add playwright -s user -- npx "@playwright/mcp@latest"
Write-Host ""

Write-Host "=== Готово ===" -ForegroundColor Green
Write-Host "Дальше ВНУТРИ claude:"
Write-Host "  /plugin marketplace add anthropics/skills"
Write-Host "  /plugin install example-skills@anthropic-agent-skills"
Write-Host "  /plugin marketplace add AThevon/genjutsu"
Write-Host "  /plugin install genjutsu"
