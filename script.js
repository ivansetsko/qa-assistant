// QA Assistant AI - Основной скрипт
// ==================================

// Конфигурация - ВАШ URL GOOGLE APPS SCRIPT СЮДА
const CONFIG = {
  demoMode: true, // Сразу включаем ИИ режим
  apiUrl: 'https://script.google.com/macros/s/AKfycbx-SuOkhe0xDVuKEt-vvXFHdTk0wSe49PM-pQttLHshKcSJdtS22P5kimFs--iSXdU97A/exec', // ВАШ URL ЗДЕСЬ
  requestCount: parseInt(localStorage.getItem('qa_ai_requests')) || 0,
  maxRequestsPerDay: 50
};

// DOM элементы
let currentGenerationType = '';

// Функции управления загрузочным экраном
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  updateUI();
  hideLoadingScreen();
  
  // Показываем что ИИ активен
  setTimeout(() => {
    const demoNote = document.querySelector('.demo-note');
    if (demoNote) {
      demoNote.innerHTML = `
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        <p><strong>ИИ-режим активен!</strong> Теперь все генерации используют реальный искусственный интеллект DeepSeek.</p>
      `;
    }
  }, 1000);
});

// ===== ОСНОВНЫЕ ФУНКЦИИ ГЕНЕРАЦИИ =====

// Генерация тест-кейсов
async function generateTestCases() {
  const input = document.getElementById('testInput').value;
  const type = document.getElementById('testType').value;
  const output = document.getElementById('testOutput');
  
  if (!input.trim()) {
    showError(output, '⚠️ Введите описание функции');
    return;
  }
  
  currentGenerationType = 'test-design';
  const prompt = createTestDesignPrompt(input, type);
  
  await generateContent(prompt, 'test-design', output);
}

// Генерация баг-репорта
async function generateBugReport() {
  const title = document.getElementById('bugTitle').value;
  const steps = document.getElementById('bugSteps').value;
  const expected = document.getElementById('expected').value;
  const actual = document.getElementById('actual').value;
  const severity = document.getElementById('severity').value;
  const priority = document.getElementById('priority').value;
  const output = document.getElementById('bugOutput');
  
  if (!title.trim()) {
    showError(output, '⚠️ Введите описание проблемы');
    return;
  }
  
  currentGenerationType = 'bug-report';
  const prompt = createBugReportPrompt(title, steps, expected, actual, severity, priority);
  
  await generateContent(prompt, 'bug-report', output);
}

// Основная функция генерации
async function generateContent(prompt, type, outputElement) {
  showLoadingScreen();
  showLoading(outputElement);
  
  try {
    // Всегда используем ИИ
    const result = await generateWithAI(prompt, type);
    outputElement.innerHTML = formatAIResponse(result);
    incrementRequestCount();
  } catch (error) {
    console.error('AI Error:', error);
    outputElement.innerHTML = `
      <div style="color: #dc2626; padding: 20px; text-align: center;">
        <h4>❌ Ошибка ИИ</h4>
        <p>${error.message || 'Неизвестная ошибка'}</p>
        <p>Попробуйте еще раз через несколько секунд</p>
      </div>
    `;
  } finally {
    hideLoadingScreen();
  }
}

// ===== РЕАЛЬНЫЙ ИИ (DeepSeek через ваш прокси) =====

async function generateWithAI(prompt, type) {
  if (!CONFIG.apiUrl) {
    throw new Error('ИИ сервис временно недоступен');
  }
  
  // Проверка лимита запросов
  if (CONFIG.requestCount >= CONFIG.maxRequestsPerDay) {
    throw new Error('Достигнут дневной лимит запросов. Попробуйте завтра.');
  }
  
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ prompt, type })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Ошибка обработки запроса ИИ');
    }
    
    return data.result;
  } catch (error) {
    console.error('Ошибка при запросе к ИИ:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Ошибка соединения с API. Проверьте настройки прокси и доступность сервиса.');
    }
    throw error;
  }
}

// ===== ПРОМПТЫ =====

function createTestDesignPrompt(input, type) {
  return `Я QA инженер. Проанализируй функционал и создай тест-дизайн.

Что тестируем: ${input}
Тип тестирования: ${type}

Требования к ответу:
1. Дай заголовок "🎯 ТЕСТ-ДИЗАЙН ДЛЯ: [название функции]"
2. Добавь краткое описание что тестируем
3. Создай тест-кейсы в формате:
   ─────────────────
   ✅ ТЕСТ-КЕЙС №X: [Название]
   • Цель: [Цель тестирования]
   • Предусловия: [Что нужно перед тестом]
   • Шаги:
     1. [Шаг 1]
     2. [Шаг 2]
     3. [Шаг 3]
   • Ожидаемый результат: [Что должно произойти]
   • Приоритет: [High/Medium/Low]
   ─────────────────

Включи:
- 3-5 позитивных сценариев
- 3-5 негативных сценариев
- 2-3 граничных случая
- Проверку валидации данных

Отвечай на русском языке, используйте Markdown разметку для форматирования.`;
}

function createBugReportPrompt(title, steps, expected, actual, severity, priority) {
  return `Я QA инженер. Создай профессиональный баг-репорт на основе этих данных:

Тема бага: ${title}

Шаги воспроизведения:
${steps}

Ожидаемый результат:
${expected}

Фактический результат:
${actual}

Серьезность: ${severity}
Приоритет: ${priority}

Требования к баг-репорту:
1. Заголовок: "🐛 БАГ-РЕПОРТ: [Краткое описание]"
2. Формат:
   ─────────────────
   🔍 ОПИСАНИЕ БАГА
   [Детальное описание проблемы]
   
   🎯 ШАГИ ВОСПРОИЗВЕДЕНИЯ
   1. [Шаг 1]
   2. [Шаг 2]
   3. [Шаг 3]
   
   ✅ ОЖИДАЕМЫЙ РЕЗУЛЬТАТ
   [Что должно было произойти]
   
   ❌ ФАКТИЧЕСКИЙ РЕЗУЛЬТАТ
   [Что произошло на самом деле]
   
   📊 СЕРЬЕЗНОСТЬ И ПРИОРИТЕТ
   • Серьезность: ${severity} - [объяснение]
   • Приоритет: ${priority} - [объяснение]
   
   🖥️ ОКРУЖЕНИЕ
   • Браузер: [укажи типовые браузеры]
   • ОС: [укажи типовые ОС]
   • Устройство: [укажи типовые устройства]
   
   📎 ПРИЛОЖЕНИЯ
   • Скриншоты ошибки
   • Логи (если есть)
   • Видеозапись (если есть)
   
   🏷️ ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
   • Репроизводимость: [Всегда/Иногда/Редко]
   • Блокирует ли функционал: [Да/Нет]
   • Версия приложения: [укажи если известна]
   ─────────────────

Отвечай на русском языке, используйте Markdown разметку для форматирования.`;
}

// ===== ФОРМАТИРОВАНИЕ ОТВЕТА =====

function formatAIResponse(text) {
  // Преобразуем Markdown в HTML
  let html = text;
  
  // Заголовки
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Жирный текст
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Курсив
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Списки
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  
  // Нумерованные списки
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');
  
  // Разделители
  html = html.replace(/^─+$/gm, '<hr>');
  
  // Сохраняем переносы строк
  html = html.replace(/\n/g, '<br>');
  
  // Добавляем классы для стилизации
  html = html.replace(/🎯/g, '<span class="emoji-title">🎯</span>');
  html = html.replace(/🐛/g, '<span class="emoji-title">🐛</span>');
  html = html.replace(/✅/g, '<span class="emoji-success">✅</span>');
  html = html.replace(/❌/g, '<span class="emoji-error">❌</span>');
  html = html.replace(/⚠️/g, '<span class="emoji-warning">⚠️</span>');
  
  return `<div class="ai-response">${html}</div>`;
}

// ===== UI ФУНКЦИИ =====

function showLoading(element) {
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>🤖 ИИ генерирует ответ...</p>
      <small>Это может занять 10-20 секунд</small>
    </div>
  `;
}

function showError(element, message) {
  element.innerHTML = `<div style="color: #dc2626; padding: 20px; text-align: center;">${message}</div>`;
}

function copyResult(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText || element.textContent;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      // Показываем уведомление
      showNotification('✅ Скопировано в буфер обмена!');
    })
    .catch(err => {
      showNotification('❌ Ошибка копирования: ' + err);
    });
}

function clearResult(elementId) {
  document.getElementById(elementId).innerHTML = `
    <div class="placeholder-text">
      <i class="fas fa-lightbulb"></i>
      <p>Здесь появятся результаты...</p>
    </div>
  `;
}

function showNotification(message) {
  // Создаем уведомление
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    ">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Удаляем через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ===== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА =====

function updateUI() {
  // Обновляем все статусы на "ИИ"
  const modeStatuses = document.querySelectorAll('.mode-status');
  modeStatuses.forEach(status => {
    status.textContent = 'ИИ';
    status.style.color = '#10b981';
  });
  
  // Включаем все переключатели
  const toggles = document.querySelectorAll('.switch input');
  toggles.forEach(toggle => {
    toggle.checked = true;
  });
  
  // Обновляем заголовки инструментов
  const toolSubtitles = document.querySelectorAll('.tool-subtitle');
  toolSubtitles.forEach(subtitle => {
    subtitle.innerHTML = '<i class="fas fa-bolt" style="color: #10b981;"></i> Работает на реальном ИИ DeepSeek';
  });
  
  // Обновляем подвал
  const currentMode = document.getElementById('currentMode');
  if (currentMode) {
    currentMode.textContent = 'Режим: ИИ (DeepSeek)';
  }
  
  // Обновляем герою
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.innerHTML = 'Генерация тест-кейсов и баг-репортов с помощью <strong style="color: #10b981;">реального искусственного интеллекта</strong>';
  }
}

// ===== СЧЕТЧИК ЗАПРОСОВ =====

function incrementRequestCount() {
  CONFIG.requestCount++;
  localStorage.setItem('qa_ai_requests', CONFIG.requestCount);
  updateRequestCounter();
  
  // Обновляем счетчики
  const tool1Count = document.getElementById('requestsCount1');
  const tool2Count = document.getElementById('requestsCount2');
  const totalRequests = document.getElementById('totalRequests');
  
  if (tool1Count) tool1Count.textContent = `Запросов: ${CONFIG.requestCount}`;
  if (tool2Count) tool2Count.textContent = `Запросов: ${CONFIG.requestCount}`;
  if (totalRequests) totalRequests.textContent = `Всего запросов: ${CONFIG.requestCount}`;
}

function updateRequestCounter() {
  const totalRequests = document.getElementById('totalRequests');
  if (totalRequests) {
    totalRequests.textContent = `Всего запросов: ${CONFIG.requestCount}`;
  }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}

function toggleMode(toolNumber) {
  // В этом режиме всегда ИИ, но показываем информацию
  const toggle = document.getElementById(`modeToggle${toolNumber}`);
  const status = document.getElementById(`modeStatus${toolNumber}`);
  
  if (!toggle.checked) {
    // Если попытались выключить ИИ
    showNotification('ℹ️ ИИ всегда включен в этом режиме работы');
    toggle.checked = true;
    status.textContent = 'ИИ';
    status.style.color = '#10b981';
  }
}

// Модальное окно - теперь просто информация
function openModal() {
  document.getElementById('aiSetupModal').style.display = 'block';
  
  // Обновляем содержимое модалки
  const modalHeader = document.querySelector('.modal-header h2');
  if (modalHeader) {
    modalHeader.innerHTML = '<i class="fas fa-rocket"></i> ИИ уже работает!';
  }
  
  const steps = document.querySelectorAll('.step-content');
  if (steps[0]) {
    steps[0].innerHTML = `
      <h3><i class="fas fa-check-circle" style="color: #10b981;"></i> ИИ интегрирован</h3>
      <p>Сайт уже использует DeepSeek API через безопасный прокси</p>
    `;
  }
  
  const modalFooter = document.querySelector('.modal-footer');
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button class="btn-test" onclick="testAIConnection()">
        <i class="fas fa-vial"></i> Протестировать ИИ подключение
      </button>
    `;
  }
}

function closeModal() {
  document.getElementById('aiSetupModal').style.display = 'none';
}

function testAIConnection() {
  showLoadingScreen();
  
  const testPrompt = 'Привет! Напиши короткое приветственное сообщение для пользователя QA Assistant AI.';
  
  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: testPrompt, type: 'test-design' })
  })
  .then(response => response.json())
  .then(data => {
    hideLoadingScreen();
    if (data.success) {
      alert('✅ ИИ подключение работает отлично!\n\nИИ ответил: "' + data.result.substring(0, 100) + '..."');
    } else {
      alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  })
  .catch(error => {
    hideLoadingScreen();
    alert('❌ Ошибка сети: ' + error.message);
  });
}

// Закрытие модалки при клике вне ее
window.onclick = function(event) {
  const modal = document.getElementById('aiSetupModal');
  if (event.target == modal) {
    closeModal();
  }
};

// Обработка мобильного меню
document.addEventListener('click', function(event) {
  const navLinks = document.querySelector('.nav-links');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  
  if (navLinks.classList.contains('active') && 
      !event.target.closest('.nav-links') && 
      !event.target.closest('.mobile-menu-btn')) {
    navLinks.classList.remove('active');
  }
});

// Анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .emoji-title { font-size: 1.2em; margin-right: 8px; }
  .emoji-success { color: #10b981; margin-right: 5px; }
  .emoji-error { color: #ef4444; margin-right: 5px; }
  .emoji-warning { color: #f59e0b; margin-right: 5px; }
  
  .ai-response {
    line-height: 1.6;
  }
  
  .ai-response h1, .ai-response h2, .ai-response h3 {
    margin: 1em 0 0.5em 0;
    color: #1e293b;
  }
  
  .ai-response ul, .ai-response ol {
    margin: 0.5em 0 0.5em 1.5em;
    padding-left: 1em;
  }
  
  .ai-response li {
    margin: 0.3em 0;
  }
  
  .ai-response hr {
    border: none;
    border-top: 2px dashed #e2e8f0;
    margin: 2em 0;
  }
`;
document.head.appendChild(style);

// Финальное скрытие загрузочного экрана
window.addEventListener('load', hideLoadingScreen);

// Тестовая функция
async function testAIDirectly() {
  console.log('Тестируем подключение...');
  
  const testData = {
    prompt: 'Тестовый запрос: напиши "Hello from DeepSeek!"',
    type: 'test-design'
  };
  
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbx-SuOkhe0xDVuKEt-vvXFHdTk0wSe49PM-pQttLHshKcSJdtS22P5kimFs--iSXdU97A/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Результат теста:', result);
    
    if (result.success) {
      alert('✅ Подключение работает! Ответ: ' + result.result.substring(0, 50));
    } else {
      alert('❌ Ошибка: ' + result.error);
    }
  } catch (error) {
    console.error('Ошибка теста:', error);
    alert('❌ Ошибка сети: ' + error.message);
  }
}

// Запусти эту функцию из консоли браузера