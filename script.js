const STORAGE_KEY = 'my-todo-tasks';
const THEME_KEY = 'my-todo-theme-index';
const THEMES = ['theme-red', 'theme-purple', 'theme-blue', 'theme-green'];
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#task-count');

function applyNextTheme() {
  const savedIndex = Number(localStorage.getItem(THEME_KEY) || '-1');
  const nextIndex = (savedIndex + 1) % THEMES.length;
  document.body.classList.add(THEMES[nextIndex]);
  localStorage.setItem(THEME_KEY, String(nextIndex));
}

applyNextTheme();
document.querySelector('#today').textContent = new Intl.DateTimeFormat('he-IL', { dateStyle: 'full' }).format(new Date());

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function render() {
  const visible = tasks.filter(task => currentFilter === 'all' || (currentFilter === 'active' ? !task.completed : task.completed));
  list.innerHTML = visible.map(task => `
    <li class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <button class="check" aria-label="${task.completed ? 'סמן כפעילה' : 'סמן כהושלמה'}"></button>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="delete" aria-label="מחק משימה">×</button>
    </li>`).join('');
  emptyState.hidden = visible.length > 0;
  const active = tasks.filter(task => !task.completed).length;
  count.textContent = `${active} ${active === 1 ? 'משימה' : 'משימות'} פעילות`;
}

function escapeHtml(text) { return text.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, completed: false });
  save(); render(); input.value = ''; input.focus();
});

list.addEventListener('click', event => {
  const item = event.target.closest('.task');
  if (!item) return;
  const id = Number(item.dataset.id);
  if (event.target.closest('.check')) tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  if (event.target.closest('.delete')) tasks = tasks.filter(task => task.id !== id);
  save(); render();
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(filter => filter.classList.toggle('active', filter === button));
  render();
}));

render();
