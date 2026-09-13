// Simple leveling system single-file app
(() => {
  // DOM refs
  const levelBadge = document.getElementById('level-badge');
  const xpText = document.getElementById('xp-text');
  const nextLevelText = document.getElementById('next-level-text');
  const progressFill = document.getElementById('progress-fill');
  const progressBar = document.getElementById('progress-bar');

  const xpInput = document.getElementById('xp-input');
  const addXpBtn = document.getElementById('add-xp-btn');
  const quickChips = document.querySelectorAll('.chip');

  const taskListEl = document.getElementById('task-list');
  const taskTitle = document.getElementById('task-title');
  const taskXp = document.getElementById('task-xp');
  const addTaskBtn = document.getElementById('add-task-btn');

  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFileInput = document.getElementById('import-file');
  const resetBtn = document.getElementById('reset-btn');

  const STORAGE_KEY = 'leveling-data-v1';

  // Default state
  const defaultState = {
    xp: 0,
    tasks: [
      { id: genId(), title: 'Welcome — complete this task', xp: 20, done: false },
      { id: genId(), title: 'Daily practice', xp: 10, done: false },
      { id: genId(), title: 'Finish a small project', xp: 50, done: false }
    ],
    createdAt: Date.now()
  };

  // Load state
  let state = loadState();

  function genId(){ return 't_' + Math.random().toString(36).slice(2,9) }

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      // Validate minimal shape
      if(typeof parsed.xp !== 'number' || !Array.isArray(parsed.tasks)) return structuredClone(defaultState);
      return parsed;
    } catch(e){
      console.warn('Failed to load state, using defaults', e);
      return structuredClone(defaultState);
    }
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Leveling rules (simple): each level threshold is level * 100 XP, starting at level 1
  function computeLevel(xp){
    const level = Math.floor(xp / 100) + 1;
    const levelStart = (level - 1) * 100;
    const levelNext = level * 100;
    const progress = Math.min(1, (xp - levelStart) / (levelNext - levelStart));
    return { level, levelStart, levelNext, progress };
  }

  function render(){
    const { level, levelNext, progress } = computeLevel(state.xp);
    levelBadge.textContent = level;
    xpText.textContent = `${state.xp} XP`;
    nextLevelText.textContent = `Next: ${levelNext} XP`;
    progressFill.style.width = `${Math.round(progress * 100)}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(progress * 100));

    renderTasks();
    saveState();
  }

  function renderTasks(){
    taskListEl.innerHTML = '';
    if(state.tasks.length === 0){
      const li = document.createElement('li');
      li.className = 'task-item';
      li.textContent = 'No tasks yet. Add one above.';
      taskListEl.appendChild(li);
      return;
    }
    state.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(task.done);
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const titleWrap = document.createElement('div');
      titleWrap.className = 'title';
      const title = document.createElement('strong');
      title.textContent = task.title;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${task.xp} XP`;
      titleWrap.append(title, meta);

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit task';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => editTask(task.id));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete task';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => deleteTask(task.id));

      actions.append(editBtn, delBtn);

      li.append(checkbox, titleWrap, actions);
      taskListEl.appendChild(li);
    });
  }

  // Task actions
  function toggleTask(id){
    const task = state.tasks.find(t => t.id === id);
    if(!task) return;
    if(!task.done){
      // mark done and award XP
      task.done = true;
      addXp(task.xp);
    } else {
      // un-checking DOES NOT subtract XP (safer). If you want subtract, implement here.
      task.done = false;
    }
    render();
  }

  function addTask(title, xp){
    const trimmed = (title || '').trim();
    if(!trimmed) return;
    state.tasks.push({ id: genId(), title: trimmed, xp: Number(xp) || 0, done: false });
    render();
  }

  function editTask(id){
    const task = state.tasks.find(t => t.id === id);
    if(!task) return;
    const newTitle = prompt('Task title', task.title);
    if(newTitle === null) return;
    const newXp = prompt('XP amount', String(task.xp));
    if(newXp === null) return;
    task.title = newTitle.trim() || task.title;
    task.xp = Math.max(0, Number(newXp) || 0);
    render();
  }

  function deleteTask(id){
    if(!confirm('Delete this task?')) return;
    state.tasks = state.tasks.filter(t => t.id !== id);
    render();
  }

  // XP actions
  function addXp(amount){
    const n = Number(amount) || 0;
    if(n <= 0) return;
    state.xp = Math.max(0, Math.floor(state.xp + n));
    render();
  }

  // Storage and utilities
  function exportJson(){
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leveling-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importJsonFile(file){
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if(typeof parsed.xp === 'number' && Array.isArray(parsed.tasks)){
          if(confirm('Replace current data with imported data?')) {
            state = parsed;
            render();
            alert('Import successful.');
          }
        } else {
          alert('Invalid file format.');
        }
      } catch(e){
        alert('Failed to parse JSON.');
      }
    };
    reader.readAsText(file);
  }

  function resetAll(){
    if(!confirm('This will reset all data and cannot be undone. Continue?')) return;
    state = structuredClone(defaultState);
    saveState();
    render();
  }

  // Event bindings
  addXpBtn.addEventListener('click', () => {
    addXp(xpInput.value || 0);
    xpInput.value = '';
  });

  xpInput.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ addXpBtn.click(); } });

  quickChips.forEach(c => {
    c.addEventListener('click', () => addXp(Number(c.dataset.xp)));
  });

  addTaskBtn.addEventListener('click', () => {
    addTask(taskTitle.value, taskXp.value);
    taskTitle.value = '';
    taskXp.value = '10';
  });

  taskTitle.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ addTaskBtn.click(); } });

  exportBtn.addEventListener('click', exportJson);

  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if(f) importJsonFile(f);
    importFileInput.value = '';
  });

  resetBtn.addEventListener('click', resetAll);

  // Initial render
  render();

  // Expose some helpers to window for debugging (optional)
  window.LevelingApp = {
    getState: () => structuredClone(state),
    setState: s => { state = s; saveState(); render(); }
  };

})();
