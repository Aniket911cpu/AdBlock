// options.js

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-item');
  const contents = document.querySelectorAll('.tab-content');
  const whitelistInput = document.getElementById('whitelistInput');
  const saveWhitelistBtn = document.getElementById('saveWhitelist');
  const saveStatus = document.getElementById('saveStatus');

  // Tab Navigation
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      // Update Tab Styles
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show Content
      const targetId = tab.getAttribute('data-tab');
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetId) content.classList.add('active');
      });
    });
  });

  // Support button: open feedback in new tab
  const openFeedbackBtn = document.getElementById('openFeedbackBtn');
  if (openFeedbackBtn) {
    openFeedbackBtn.addEventListener('click', () => {
      try {
        chrome.tabs.create({ url: chrome.runtime.getURL('feedback.html') });
      } catch (e) {
        window.open('feedback.html', '_blank');
      }
    });
  }

  // Open rate page from options
  const openRateBtn = document.getElementById('openRateBtn');
  const RATE_URL = 'https://chrome.google.com/webstore/detail/EXTENSION_ID/reviews';
  if (openRateBtn) {
    openRateBtn.addEventListener('click', () => {
      try { chrome.tabs.create({ url: RATE_URL }); }
      catch (e) { window.open(RATE_URL, '_blank'); }
    });
  }

  // Load Whitelist
  chrome.storage.local.get(['whitelistedDomains'], (data) => {
    if (data.whitelistedDomains) {
      whitelistInput.value = data.whitelistedDomains.join('\n');
    }
  });

  // Save Whitelist
  saveWhitelistBtn.addEventListener('click', () => {
    const rawInput = whitelistInput.value;
    // Process input: split by line, trim, remove empty
    const domains = rawInput.split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0)
      // Basic validation to ensure clean domain names
      .map(d => d.replace(/^https?:\/\//, '').replace(/\/$/, ''));

    // Remove duplicates
    const uniqueDomains = [...new Set(domains)];

    chrome.storage.local.set({ whitelistedDomains: uniqueDomains }, () => {
      // Notify background to update rules
      uniqueDomains.forEach(domain => {
        chrome.runtime.sendMessage({ action: 'updateWhitelist', domain: domain, add: true });
      });

      // Show feedback
      saveStatus.textContent = 'Saved successfully!';
      setTimeout(() => {
        saveStatus.textContent = '';
      }, 2000);
    });
  });

  // Todos Management
  const todoInput = document.getElementById('todoInput');
  const addTodoBtn = document.getElementById('addTodoBtn');
  const todoList = document.getElementById('todoList');

  // Load todos from storage
  function loadTodos() {
    chrome.storage.local.get(['todos'], (data) => {
      const todos = data.todos || [];
      todoList.innerHTML = '';
      todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${idx}">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <button class="todo-delete" data-index="${idx}">Delete</button>
        `;
        todoList.appendChild(li);
      });

      // Add event listeners to checkboxes and delete buttons
      document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'));
          toggleTodo(idx);
        });
      });

      document.querySelectorAll('.todo-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'));
          deleteTodo(idx);
        });
      });
    });
  }

  function toggleTodo(idx) {
    chrome.storage.local.get(['todos'], (data) => {
      const todos = data.todos || [];
      if (todos[idx]) {
        todos[idx].completed = !todos[idx].completed;
        chrome.storage.local.set({ todos }, loadTodos);
      }
    });
  }

  function deleteTodo(idx) {
    chrome.storage.local.get(['todos'], (data) => {
      const todos = data.todos || [];
      todos.splice(idx, 1);
      chrome.storage.local.set({ todos }, loadTodos);
    });
  }

  function addTodo(text) {
    if (!text.trim()) return;
    chrome.storage.local.get(['todos'], (data) => {
      const todos = data.todos || [];
      todos.push({ text: text.trim(), completed: false });
      chrome.storage.local.set({ todos }, () => {
        loadTodos();
        todoInput.value = '';
      });
    });
  }

  addTodoBtn.addEventListener('click', () => {
    addTodo(todoInput.value);
  });

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo(todoInput.value);
    }
  });

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Load todos on page load
  loadTodos();