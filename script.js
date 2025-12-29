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
  updateAIStatus();
  loadRequestCount();
  
  // Добавляем переключатель ИИ/Демо
  addAIToggle();
  
  // Скрываем загрузочный экран при загрузке страницы
  hideLoadingScreen();
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
  
  if (CONFIG.demoMode || !CONFIG.apiUrl) {
    // Демо-режим
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
      outputElement.innerHTML = result;
      incrementRequestCount();
      hideLoadingScreen();
    } catch (error) {
      outputElement.innerHTML = `
        <div style="color: #dc2626; padding: 20px;">
          <h4>❌ Ошибка подключения к ИИ</h4>
          <p>${error.message}</p>
          <p>Переключаю в демо-режим...</p>
        </div>
      `;
      hideLoadingScreen();
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

function clearResult(elementId) {
  document.getElementById(elementId).innerHTML = `
    <div class="placeholder-text">
      <i class="fas fa-lightbulb"></i>
      <p>Здесь появятся результаты...</p>
    </div>
  `;
}

// ===== УПРАВЛЕНИЕ ИИ ПОДКЛЮЧЕНИЕМ =====

function addAIToggle() {
  // Эта функция уже реализована в HTML переключателями
  // Здесь можно добавить дополнительную логику если нужно
}

function toggleMode(toolNumber) {
  const toggle = document.getElementById(`modeToggle${toolNumber}`);
  const status = document.getElementById(`modeStatus${toolNumber}`);
  
  if (toggle.checked) {
    status.textContent = 'ИИ';
    status.style.color = '#10b981';
    // Проверяем наличие API URL
    if (!CONFIG.apiUrl) {
      alert('⚠️ Сначала настройте ИИ подключение в настройках');
      toggle.checked = false;
      status.textContent = 'Демо';
      status.style.color = '';
      openModal();
    }
  } else {
    status.textContent = 'Демо';
    status.style.color = '';
  }
}

function updateAIStatus() {
  // Обновляем статус в подвале
  const currentModeElement = document.getElementById('currentMode');
  if (currentModeElement) {
    const isAIActive = !CONFIG.demoMode && CONFIG.apiUrl;
    currentModeElement.textContent = isAIActive ? 'Режим: ИИ' : 'Режим: Демо';
  }
}

// ===== МОДАЛЬНОЕ ОКНО НАСТРОЙКИ =====

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
      const btn = document.querySelector('.btn-copy');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
        setTimeout(() => {
          btn.innerHTML = original;
        }, 2000);
      }
      alert('URL скопирован в буфер обмена!');
    })
    .catch(err => {
      alert('Ошибка копирования: ' + err);
    });
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

function testConnection() {
  if (!CONFIG.apiUrl) {
    alert('Сначала сохраните API URL');
    return;
  }
  
  showLoadingScreen();
  
  // Тестовый запрос
  const testPrompt = 'Тестовый запрос';
  const testType = 'test-design';
  
  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: testPrompt, type: testType })
  })
  .then(response => response.json())
  .then(data => {
    hideLoadingScreen();
    if (data.success) {
      alert('✅ Подключение успешно! ИИ готов к работе.');
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
  
  // Обновляем счетчики в каждом инструменте
  const tool1Count = document.getElementById('requestsCount1');
  const tool2Count = document.getElementById('requestsCount2');
  const totalRequests = document.getElementById('totalRequests');
  
  if (tool1Count) tool1Count.textContent = `Запросов: ${CONFIG.requestCount}`;
  if (tool2Count) tool2Count.textContent = `Запросов: ${CONFIG.requestCount}`;
  if (totalRequests) totalRequests.textContent = `Всего запросов: ${CONFIG.requestCount}`;
}

function loadRequestCount() {
  updateRequestCounter();
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

// Убедимся, что загрузочный экран скрыт при любых действиях пользователя
document.addEventListener('click', hideLoadingScreen);
document.addEventListener('keydown', hideLoadingScreen);

// Финальное скрытие загрузочного экрана при полной загрузке
window.addEventListener('load', hideLoadingScreen);