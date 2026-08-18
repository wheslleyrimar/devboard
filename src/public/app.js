const API_BASE = '/api/projects';

const STATUS_LABEL = { active:'Ativo', paused:'Pausado', completed:'Concluído' };
const TASK_STATUS_LABEL = { todo:'A Fazer', in_progress:'Em Progresso', done:'Concluída' };
const TASK_PRIORITY_LABEL = { low:'Baixa', medium:'Média', high:'Alta' };

let projects = [];
let currentFilter = 'all';
let currentSearch = '';
let activeProject = null;

const grid = document.getElementById('grid');
const filtersEl = document.getElementById('filters');
const searchInput = document.getElementById('searchInput');

async function fetchProjects(){
  const res = await fetch(API_BASE);
  if(!res.ok) throw new Error('Falha ao carregar projetos');
  projects = await res.json();
}

function formatDate(d){
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
}

function updateSummary(){
  document.getElementById('countTotal').textContent = projects.length;
  document.getElementById('countActive').textContent = projects.filter(p=>p.status==='active').length;
  document.getElementById('countPaused').textContent = projects.filter(p=>p.status==='paused').length;
  document.getElementById('countCompleted').textContent = projects.filter(p=>p.status==='completed').length;
}

function render(){
  updateSummary();

  let list = projects.filter(p => currentFilter === 'all' || p.status === currentFilter);
  if(currentSearch.trim()){
    const q = currentSearch.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.stack.some(s => s.toLowerCase().includes(q))
    );
  }

  // most recently updated first
  list = [...list].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if(list.length === 0){
    grid.innerHTML = `<div class="empty-state">Nenhum projeto encontrado.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="card" data-id="${p.id}">
      <div class="card-head">
        <div class="card-title">${escapeHtml(p.name)}</div>
        <span class="status-badge ${p.status}"><span class="dot ${p.status}"></span>${STATUS_LABEL[p.status]}</span>
      </div>
      <div class="card-desc">${escapeHtml(p.desc)}</div>
      <div class="stack">
        ${p.stack.map(s => `<span class="stack-tag">${escapeHtml(s)}</span>`).join('')}
      </div>
      <div class="card-foot">
        <span class="updated">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Atualizado em ${formatDate(p.updatedAt)}
        </span>
        <span>${p.tasks.length} tarefa${p.tasks.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  render();
});

searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  render();
});

// Create project modal
const modalOverlay = document.getElementById('modalOverlay');
const projectForm = document.getElementById('projectForm');

document.getElementById('newProjectBtn').addEventListener('click', () => {
  modalOverlay.classList.add('open');
  document.getElementById('fName').focus();
});
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });

function closeModal(){
  modalOverlay.classList.remove('open');
  projectForm.reset();
}

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('fName').value.trim();
  const desc = document.getElementById('fDesc').value.trim();
  const stack = document.getElementById('fStack').value.split(',').map(s=>s.trim()).filter(Boolean);
  const status = document.getElementById('fStatus').value;

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, desc, stack, status }),
  });
  if(!res.ok){
    const { error } = await res.json().catch(() => ({ error: 'Falha ao criar projeto' }));
    alert(error);
    return;
  }

  await fetchProjects();

  closeModal();
  currentFilter = 'all';
  filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  filtersEl.querySelector('[data-filter="all"]').classList.add('active');
  render();
});

// Project detail modal + tasks
const detailModalOverlay = document.getElementById('detailModalOverlay');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if(!card) return;
  openProjectDetail(card.dataset.id);
});

async function openProjectDetail(id){
  const res = await fetch(`${API_BASE}/${id}`);
  if(!res.ok) return;
  activeProject = await res.json();

  document.getElementById('detailName').textContent = activeProject.name;
  const badge = document.getElementById('detailStatusBadge');
  badge.className = `status-badge ${activeProject.status}`;
  badge.innerHTML = `<span class="dot ${activeProject.status}"></span>${STATUS_LABEL[activeProject.status]}`;
  document.getElementById('detailDesc').textContent = activeProject.desc;
  document.getElementById('detailStack').innerHTML = activeProject.stack.map(s => `<span class="stack-tag">${escapeHtml(s)}</span>`).join('');

  taskForm.classList.remove('open');
  taskForm.reset();
  renderTaskList(activeProject);

  detailModalOverlay.classList.add('open');
}

function renderTaskList(project){
  if(project.tasks.length === 0){
    taskList.innerHTML = `<div class="task-empty">Nenhuma tarefa ainda.</div>`;
    return;
  }

  // server already orders tasks by createdAt desc
  taskList.innerHTML = project.tasks.map(t => `
    <div class="task-row">
      <div class="task-row-head">
        <span class="task-title">${escapeHtml(t.title)}</span>
        <span class="task-badges">
          <span class="priority-badge ${t.priority}">${TASK_PRIORITY_LABEL[t.priority]}</span>
          <span class="status-badge ${t.status === 'done' ? 'completed' : t.status === 'in_progress' ? 'active' : 'paused'}">${TASK_STATUS_LABEL[t.status]}</span>
        </span>
      </div>
      <div class="task-desc">${escapeHtml(t.desc)}</div>
    </div>
  `).join('');
}

document.getElementById('toggleTaskFormBtn').addEventListener('click', () => {
  taskForm.classList.toggle('open');
  if(taskForm.classList.contains('open')) document.getElementById('tTitle').focus();
});
document.getElementById('cancelTaskBtn').addEventListener('click', () => {
  taskForm.classList.remove('open');
  taskForm.reset();
});
document.getElementById('closeDetailBtn').addEventListener('click', closeDetailModal);
detailModalOverlay.addEventListener('click', (e) => { if(e.target === detailModalOverlay) closeDetailModal(); });

function closeDetailModal(){
  detailModalOverlay.classList.remove('open');
  activeProject = null;
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!activeProject) return;

  const title = document.getElementById('tTitle').value.trim();
  const desc = document.getElementById('tDesc').value.trim();
  const priority = document.getElementById('tPriority').value;
  const status = document.getElementById('tStatus').value;

  const res = await fetch(`${API_BASE}/${activeProject.id}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, desc, priority, status }),
  });
  if(!res.ok){
    const { error } = await res.json().catch(() => ({ error: 'Falha ao criar tarefa' }));
    alert(error);
    return;
  }

  taskForm.classList.remove('open');
  taskForm.reset();

  // creating a task bumps the project's updatedAt, refetch detail + list to reflect reordering
  await openProjectDetail(activeProject.id);
  await fetchProjects();
  render();
});

// Mobile sidebar toggle
document.getElementById('mobileToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

async function init(){
  await fetchProjects();
  render();
}

init();
