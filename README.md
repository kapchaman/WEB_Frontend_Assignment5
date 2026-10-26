# ORBIT After Hours

Personal JavaScript assignment for **Alikhan Shikhiyev**, group **IT-2510**, Astana IT University.

Repository: https://github.com/kapchaman/WEB_Frontend_Assignment5

[Download the assignment report](Assignment5_AlikhanShikhiyev.docx)
The theme combines an Astro Club evening in Astana with music after the observations.

## Запуск за 10 секунд

1. Скачай репозиторий как ZIP или клонируй его.
2. Распакуй архив и открой папку проекта.
3. Дважды нажми `index.html`. Откроется обычный браузер.

Ничего устанавливать не нужно. Интернет, Node.js и npm для сайта не нужны.
В VS Code можно открыть эту папку и запустить `index.html` через Live Server,
если расширение уже установлено. CodeX для запуска не нужен.

## Что реализовано

| Задание | Вариант | Файл |
| --- | --- | --- |
| Task 1 | B — Turn-based battle | `js/task1-battle.js` |
| Task 2 | A — Kanban board | `js/task2-board.js` |
| Task 3 | B — Character creator | `js/task3-crew.js` |

`index.html` задаёт структуру, `styles.css` — весь внешний вид. У каждой задачи
свой внешний JS с `defer`. На странице нет библиотек, inline-обработчиков и
`innerHTML`. Цвет карточки, ошибки и исход боя меняются через CSS-классы.

Состояние хранится в памяти вкладки: перезагрузка сбрасывает бой, задачи и
зарезервированные имена. Кнопка Restart сбрасывает только бой. Clear form
сбрасывает поля, но сохраняет последнюю выданную карточку и занятое имя до
перезагрузки. Это намеренное поведение.

## Отчёт и защита

В `Assignment5_AlikhanShikhiyev.docx` указаны студент, группа IT-2510,
варианты B / A / B и ссылка на этот репозиторий. В отчёте есть скриншоты,
таблица правил валидации и заключение.

Прочитай и адаптируй объяснения своими словами. В задании требуется
самостоятельная защита и live coding. Сдавай отчёт в DOCX или PDF:
ссылка на репозиторий или ZIP не заменяет сам отчёт.

## Клонирование

```bash
git clone https://github.com/kapchaman/WEB_Frontend_Assignment5.git
cd WEB_Frontend_Assignment5
```

Дальше открой `index.html` в браузере. Проект самостоятельный и не зависит
от CosmoLens. GitHub Pages для запуска не требуется.

## Быстрая демонстрация

- Игра: Repair при полном HP даёт объяснение, не тратит ход. Attack, Defend,
  затем Repair. После победы или поражения кнопки блокируются. Restart работает
  без перезагрузки.
- Доска: сначала In progress уже содержит 3 задачи. Попытайся добавить ещё одну.
  Затем переведи активную задачу в Done и добавь новую. Найди Music и введи
  бессмысленный запрос для пустого состояния.
- Форма: `Nova`, Observer, Signal amber, навыки 5/5/6/5 дают четыре ошибки.
  Рабочий вариант: `Xialik`, Observer, Aurora mint, навыки **4/4/8/4**.
  Порядок: Navigation / Engineering / Science / Stamina.
- После успешного создания попробуй снова `xIaLiK`: имя уже занято в этой сессии.

## Дополнительная проверка

Если установлен Node.js, можно запустить `node tests/logic-tests.cjs`.
19 проверок покрывают игровую логику, изменённые константы, подсчёты доски и
пользовательские правила формы. Они не заменяют проверку в браузере.

Смотри `DEFENSE_RU.md` для объяснений и упражнений, а `QA.md` — для результата
проверки. Внешние изображения, шрифты, CDN, ключи и сетевые запросы не нужны.
