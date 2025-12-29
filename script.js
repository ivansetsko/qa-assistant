// QA Assistant AI - Основной скрипт
// ==================================

// КОНФИГУРАЦИЯ С РЕАЛЬНЫМ URL
const CONFIG = {
  demoMode: false, // Режим ИИ по умолчанию
  apiUrl: 'https://script.google.com/macros/s/AKfycbx-SuOkhe0xDVuKEt-vvXFHdTk0wSe49PM-pQttLHshKcSJdtS22P5kimFs--iSXdU97A/exec',
  requestCount: parseInt(localStorage.getItem('qa_ai_requests')) || 0,
  maxRequestsPerDay: 1000
};

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
  console.log('QA Assistant AI запущен');
  console.log('Режим:', CONFIG.demoMode ? 'Демо' : 'ИИ');
  console.log('API URL:', CONFIG.apiUrl);
  
  updateRequestCounter();
  hideLoadingScreen();
  
  // Убедимся что переключатели в правильном положении
  const toggle1 = document.getElementById('modeToggle1');
  const toggle2 = document.getElementById('modeToggle2');
  if (toggle1) toggle1.checked = true;
  if (toggle2) toggle2.checked = true;
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
  
  const prompt = createBugReportPrompt(title, steps, expected, actual, severity, priority);
  await generateContent(prompt, 'bug-report', output);
}

// Основная функция генерации
async function generateContent(prompt, type, outputElement) {
  showLoadingScreen();
  showLoading(outputElement);
  
  if (CONFIG.demoMode || !CONFIG.apiUrl) {
    // Демо-режим (запасной вариант)
    setTimeout(() => {
      const result = generateDemoContent(prompt, type);
      outputElement.innerHTML = result;
      incrementRequestCount();
      hideLoadingScreen();
    }, 1500);
  } else {
    // Режим с реальным ИИ
    try {
      const result = await generateWithAI(prompt, type);
      outputElement.innerHTML = formatAIResponse(result);
      incrementRequestCount();
    } catch (error) {
      console.error('Ошибка ИИ:', error);
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
}

// ===== РЕАЛЬНЫЙ ИИ (DeepSeek через твой прокси) =====

async function generateWithAI(prompt, type) {
  if (!CONFIG.apiUrl) {
    throw new Error('ИИ сервис временно недоступен');
  }
  
  console.log('Отправка запроса к ИИ...', { type, promptLength: prompt.length });
  
  // Таймаут 45 секунд
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, type }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Ответ от ИИ получен');
    
    if (!data.success) {
      throw new Error(data.error || 'Ошибка обработки запроса');
    }
    
    return data.result;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Таймаут запроса. Сервер не ответил за 45 секунд');
    }
    throw error;
  }
}

// ===== ДЕМО-РЕЖИМ (запасной вариант) =====

function generateDemoContent(prompt, type) {
  if (type === 'test-design') {
    return `
<div class="ai-response">
🎯 <b>СГЕНЕРИРОВАННЫЕ ТЕСТ-КЕЙСЫ</b>
─────────────────────────────
<i>Пример ответа от ИИ</i>

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
</div>
    `;
  } else {
    return `
<div class="ai-response">
🐛 <b>БАГ-РЕПОРТ</b>
─────────────────────────────
<i>Пример ответа от ИИ</i>

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
</div>
    `;
  }
}

// ===== ПРОМПТЫ =====

function createTestDesignPrompt(input, type) {
  return `Я QA инженер. Проанализируй функционал и создай тест-дизайн.

Что тестируем: ${input}
Тип тестирования: ${type}

Создай тест-кейсы в формате:
1. Позитивные сценарии (3-5 кейсов)
2. Негативные сценарии (3-5 кейсов) 
3. Edge-кейсы (2-3 кейса)
4. Валидацию данных

Формат каждого тест-кейса:
• Цель
• Предусловия  
• Шаги (нумерованный список)
• Ожидаемый результат
• Приоритет (High/Medium/Low)

Отвечай на русском языке, используй Markdown разметку для форматирования.`;
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

Создай баг-репорт с разделами:
1. Описание бага
2. Шаги воспроизведения  
3. Ожидаемый vs Фактический результат
4. Серьезность и Приоритет с объяснением
5. Окружение (браузер, ОС, устройство)
6. Приложения (скриншоты, логи)
7. Дополнительная информация

Отвечай на русском языке, используй Markdown разметку для форматирования.`;
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
  
  // Нумерованные списки
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
  
  // Разделители
  html = html.replace(/^─+$/gm, '<hr>');
  
  // Сохраняем переносы строк
  html = html.replace(/\n/g, '<br>');
  
  // Добавляем эмодзи классы
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
  const notification = document.createElement('div');
  notification.style.cssText = `
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
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ===== УПРАВЛЕНИЕ РЕЖИМАМИ =====

function toggleMode(toolNumber) {
  const toggle = document.getElementById(`modeToggle${toolNumber}`);
  const status = document.getElementById(`modeStatus${toolNumber}`);
  
  if (toggle.checked) {
    status.textContent = 'ИИ';
    status.style.color = '#10b981';
  } else {
    status.textContent = 'Демо';
    status.style.color = '';
    CONFIG.demoMode = true;
  }
}

// ===== МОДАЛЬНОЕ ОКНО =====

function openModal() {
  document.getElementById('aiSetupModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('aiSetupModal').style.display = 'none';
}

function copyProxyUrl() {
  const proxyUrl = document.getElementById('proxyUrl').textContent;
  navigator.clipboard.writeText(proxyUrl)
    .then(() => {
      showNotification('✅ URL скопирован!');
    })
    .catch(err => {
      showNotification('❌ Ошибка копирования: ' + err);
    });
}

function saveAPIUrl() {
  const url = document.getElementById('apiUrlInput').value.trim();
  if (!url) {
    alert('Введите URL');
    return;
  }
  
  CONFIG.apiUrl = url;
  localStorage.setItem('qa_ai_api_url', url);
  CONFIG.demoMode = false;
  
  // Обновляем переключатели
  const toggle1 = document.getElementById('modeToggle1');
  const toggle2 = document.getElementById('modeToggle2');
  const status1 = document.getElementById('modeStatus1');
  const status2 = document.getElementById('modeStatus2');
  
  if (toggle1) toggle1.checked = true;
  if (toggle2) toggle2.checked = true;
  if (status1) {
    status1.textContent = 'ИИ';
    status1.style.color = '#10b981';
  }
  if (status2) {
    status2.textContent = 'ИИ';
    status2.style.color = '#10b981';
  }
  
  alert('✅ URL сохранен! ИИ режим активирован.');
  closeModal();
}

function testConnection() {
  showLoadingScreen();
  
  const testPrompt = 'Тестовый запрос: напиши "Подключение к ИИ работает успешно!"';
  
  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: testPrompt, type: 'test-design' })
  })
  .then(response => response.json())
  .then(data => {
    hideLoadingScreen();
    if (data.success) {
      alert('✅ Подключение к ИИ работает отлично!\n\nОтвет ИИ: "' + data.result.substring(0, 100) + '..."');
    } else {
      alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  })
  .catch(error => {
    hideLoadingScreen();
    alert('❌ Ошибка сети: ' + error.message);
  });
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
`;
document.head.appendChild(style);

// Финальное скрытие загрузочного экрана
window.addEventListener('load', hideLoadingScreen);