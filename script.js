// QA Assistant AI - Основной скрипт
// ==================================

// Конфигурация
const CONFIG = {
  demoMode: true, // Режим демо по умолчанию
  apiUrl: localStorage.getItem('qa_ai_api_url') || '',
  requestCount: parseInt(localStorage.getItem('qa_ai_requests')) || 0,
  maxDemoRequests: 20
};

// DOM элементы
let currentGenerationType = '';

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  updateAIStatus();
  loadRequestCount();
  
  // Добавляем переключатель ИИ/Демо
  addAIToggle();
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
  showLoading(outputElement);
  
  if (CONFIG.demoMode || !CONFIG.apiUrl) {
    // Демо-режим
    setTimeout(() => {
      const result = generateDemoContent(prompt, type);
      outputElement.innerHTML = result;
      incrementRequestCount();
    }, 1500);
  } else {
    // Режим с реальным ИИ
    try {
      const result = await generateWithAI(prompt, type);
      outputElement.innerHTML = result;
      incrementRequestCount();
    } catch (error) {
      outputElement.innerHTML = `
        <div style="color: #dc2626; padding: 20px;">
          <h4>❌ Ошибка подключения к ИИ</h4>
          <p>${error.message}</p>
          <p>Переключаю в демо-режим...</p>
        </div>
      `;
      // Автоматически переключаем в демо
      CONFIG.demoMode = true;
      updateAIToggle();
      setTimeout(() => generateContent(prompt, type, outputElement), 1000);
    }
  }
}

// ===== РЕАЛЬНЫЙ ИИ (DeepSeek) =====

async function generateWithAI(prompt, type) {
  if (!CONFIG.apiUrl) {
    throw new Error('API URL не настроен');
  }
  
  const response = await fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type })
  });
  
  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Неизвестная ошибка');
  }
  
  return data.result;
}

// ===== ДЕМО-РЕЖИМ =====

function generateDemoContent(prompt, type) {
  if (type === 'test-design') {
    return `
🎯 <b>СГЕНЕРИРОВАННЫЕ ТЕСТ-КЕЙСЫ (Демо)</b>
─────────────────────────────
<i>Пример реального ответа от ИИ</i>

✅ <u>ТЕСТ-КЕЙС 1: ПОЗИТИВНЫЙ СЦЕНАРИЙ</u>
<b>Цель:</b> Проверка успешного выполнения основной функции
<b>Предусловия:</b> Система доступна, пользователь авторизован
<b>Шаги:</b>
1. Заполнить все обязательные поля валидными данными
2. Нажать основную кнопку действия
<b>Ожидаемый результат:</b> Успешное выполнение операции
<b>Примечания:</b> Проверить сообщение об успехе

❌ <u>ТЕСТ-КЕЙС 2: НЕГАТИВНЫЙ СЦЕНАРИЙ</u>
<b>Цель:</b> Проверка валидации неверных данных
<b>Шаги:</b>
1. Ввести невалидные данные в обязательное поле
2. Попытаться отправить форму
<b>Ожидаемый результат:</b> Отображение понятной ошибки
<b>Примечания:</b> Проверить подсветку неверного поля

⚠️ <u>ТЕСТ-КЕЙС 3: ГРАНИЧНЫЙ СЛУЧАЙ</u>
<b>Цель:</b> Проверка обработки максимального объема
<b>Шаги:</b>
1. Ввести максимально допустимое количество символов
2. Проверить отображение и поведение
<b>Ожидаемый результат:</b> Данные принимаются без ошибок

─────────────────────────────
<i>🤖 Для реальной ИИ-генерации настрой подключение</i>
    `;
  } else {
    return `
🐛 <b>БАГ-РЕПОРТ (Демо)</b>
─────────────────────────────
<i>Пример реального ответа от ИИ</i>

<b>Title:</b> Кнопка "Отправить" не активна после заполнения формы

<b>Environment:</b>
• Браузер: Chrome 122.0.0.0
• ОС: Windows 11
• Устройство: Desktop
• Версия: 2.5.1

<b>Steps to Reproduce:</b>
1. Открыть страницу с формой
2. Заполнить все обязательные поля валидными данными
3. Наблюдать за состоянием кнопки "Отправить"

<b>Expected Result:</b>
Кнопка "Отправить" становится активной (кликабельной)

<b>Actual Result:</b>
Кнопка "Отправить" остается неактивной (disabled)

<b>Evidence:</b>
Скриншот формы с заполненными полями и неактивной кнопкой

<b>Severity:</b> Major
<b>Priority:</b> High

<b>Additional Context:</b>
• Репроизводится: Всегда
• Блокирует отправку данных
• Найдено при тестировании новой версии

─────────────────────────────
<i>🤖 Для реальной ИИ-генерации настрой подключение</i>
    `;
  }
}

// ===== ПРОМПТЫ =====

function createTestDesignPrompt(input, type) {
  return `Создай тест-дизайн для: ${input}
Тип тестирования: ${type}

Включи:
1. Позитивные сценарии (3-5 кейсов)
2. Негативные сценарии (3-5 кейсов)
3. Edge-кейсы (2-3 кейса)
4. Валидацию данных

Формат каждого тест-кейса:
• Название
• Цель
• Предусловия
• Шаги (нумерованный список)
• Ожидаемый результат
• Примечания`;
}

function createBugReportPrompt(title, steps, expected, actual, severity, priority) {
  return `Создай профессиональный баг-репорт:
Title: ${title}

Steps to Reproduce:
${steps}

Expected Result:
${expected}

Actual Result:
${actual}

Severity: ${severity}
Priority: ${priority}

Формат:
1. Title (кратко и понятно)
2. Environment (браузер, ОС, устройство)
3. Steps to Reproduce (детальные шаги)
4. Expected vs Actual Result
5. Evidence (что приложить)
6. Severity & Priority (с объяснением)
7. Additional Context`;
}

// ===== UI ФУНКЦИИ =====

function showLoading(element) {
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>${CONFIG.demoMode ? 'Демо-генерация...' : 'ИИ генерирует ответ...'}</p>
      ${CONFIG.demoMode ? '<small>Для реального ИИ настрой подключение</small>' : ''}
    </div>
  `;
}

function showError(element, message) {
  element.innerHTML = `<div style="color: #dc2626; padding: 20px; text-align: center;">${message}</div>`;
}

function copyResult(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text)
    .then(() => {
      const buttons = document.querySelectorAll('.btn-copy');
      buttons.forEach(btn => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
        setTimeout(() => {
          btn.innerHTML = original;
        }, 2000);
      });
    })
    .catch(err => {
      alert('Не удалось скопировать: ' + err);
    });
}

// ===== УПРАВЛЕНИЕ ИИ ПОДКЛЮЧЕНИЕМ =====

function addAIToggle() {
  const tools = document.querySelectorAll('.tool-card');
  tools.forEach(tool => {
    const toggleHTML = `
      <div class="ai-toggle">
        <span>🤖 Режим:</span>
        <label class="toggle-switch">
          <input type="checkbox" id="aiToggle" ${CONFIG.demoMode ? '' : 'checked'} onchange="toggleAIMode()">
          <span class="toggle-slider"></span>
        </label>
        <span>${CONFIG.demoMode ? 'Демо' : 'ИИ'}</span>
        <div class="ai-status ${CONFIG.apiUrl ? 'connected' : 'disconnected'}">
          ${CONFIG.apiUrl ? '✓ ИИ подключен' : '⚠️ ИИ не настроен'}
        </div>
      </div>
    `;
    tool.insertAdjacentHTML('afterbegin', toggleHTML);
  });
}

function toggleAIMode() {
  const toggle = document.getElementById('aiToggle');
  CONFIG.demoMode = !toggle.checked;
  updateAIStatus();
}

function updateAIStatus() {
  const statusElements = document.querySelectorAll('.ai-status');
  statusElements.forEach(el => {
    if (CONFIG.apiUrl && !CONFIG.demoMode) {
      el.textContent = '✓ ИИ подключен';
      el.className = 'ai-status connected';
    } else if (CONFIG.demoMode) {
      el.textContent = '⚡ Демо-режим';
      el.className = 'ai-status disconnected';
    } else {
      el.textContent = '⚠️ ИИ не настроен';
      el.className = 'ai-status disconnected';
    }
  });
}

function updateAIToggle() {
  const toggle = document.getElementById('aiToggle');
  if (toggle) {
    toggle.checked = !CONFIG.demoMode;
  }
}

// ===== МОДАЛЬНОЕ ОКНО НАСТРОЙКИ =====

function openModal() {
  document.getElementById('aiSetupModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('aiSetupModal').style.display = 'none';
}

function copyScriptCode() {
  const scriptCode = `// Вставь этот код в Google Apps Script
const API_KEY = 'ТВОЙ_API_КЛЮЧ_ЗДЕСЬ';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { prompt, type } = data;
    
    let systemPrompt = '';
    if (type === 'test-design') {
      systemPrompt = 'Ты — опытный QA инженер. Создай подробные тест-кейсы.';
    } else {
      systemPrompt = 'Ты — QA lead. Создай профессиональный баг-репорт.';
    }
    
    const response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${API_KEY}\`
      },
      payload: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500
      })
    });
    
    const result = JSON.parse(response.getContentText());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        result: result.choices[0].message.content 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  navigator.clipboard.writeText(scriptCode)
    .then(() => alert('Код скопирован! Вставь его в Google Apps Script'));
}

function saveAPIUrl() {
  const url = document.getElementById('apiUrlInput').value.trim();
  if (!url) {
    alert('Введите URL');
    return;
  }
  
  if (!url.includes('script.google.com')) {
    alert('URL должен быть от Google Apps Script');
    return;
  }
  
  CONFIG.apiUrl = url;
  localStorage.setItem('qa_ai_api_url', url);
  updateAIStatus();
  alert('✅ URL сохранен! Теперь можно использовать реальный ИИ.');
  closeModal();
}

// ===== СЧЕТЧИК ЗАПРОСОВ =====

function incrementRequestCount() {
  CONFIG.requestCount++;
  localStorage.setItem('qa_ai_requests', CONFIG.requestCount);
  updateRequestCounter();
}

function loadRequestCount() {
  const counter = document.getElementById('requestCounter');
  if (counter) {
    counter.textContent = CONFIG.requestCount;
  }
}

function updateRequestCounter() {
  const counter = document.getElementById('requestCounter');
  if (counter) {
    counter.textContent = CONFIG.requestCount;
  }
}

// Закрытие модалки при клике вне ее
window.onclick = function(event) {
  const modal = document.getElementById('aiSetupModal');
  if (event.target == modal) {
    closeModal();
  }
};

// Добавляем счетчик запросов в подвал
document.addEventListener('DOMContentLoaded', function() {
  const footer = document.querySelector('footer .container');
  if (footer) {
    footer.innerHTML += `
      <div style="margin-top: 20px; font-size: 14px; color: #94a3b8;">
        Запросов сегодня: <span id="requestCounter">${CONFIG.requestCount}</span> | 
        Режим: <span id="modeIndicator">${CONFIG.demoMode ? 'Демо' : 'ИИ'}</span>
      </div>
    `;
  }
});