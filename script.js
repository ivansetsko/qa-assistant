// Генератор тест-кейсов
function generateTestCases() {
    const input = document.getElementById('testInput').value;
    const type = document.getElementById('testType').value;
    const output = document.getElementById('testOutput');
    
    if (!input.trim()) {
        output.innerHTML = '<div style="color: #dc2626; padding: 20px; text-align: center;">⚠️ Введите описание функции</div>';
        return;
    }
    
    output.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> ИИ генерирует тест-кейсы...</div>';
    
    setTimeout(() => {
        output.innerHTML = `
🎯 <b>Сгенерированные тест-кейсы</b>
─────────────────────────────
<b>Функция:</b> ${input}
<b>Тип тестирования:</b> ${type}

✅ <u>ТЕСТ-КЕЙС 1: ПОЗИТИВНЫЙ СЦЕНАРИЙ</u>
<b>Цель:</b> Проверка успешного выполнения
<b>Шаги:</b>
1. Заполнить валидные данные
2. Нажать основную кнопку
<b>Ожидаемый результат:</b> Успешное выполнение

❌ <u>ТЕСТ-КЕЙС 2: НЕГАТИВНЫЙ СЦЕНАРИЙ</u>
<b>Цель:</b> Проверка валидации
<b>Шаги:</b>
1. Ввести неверные данные
2. Попытаться отправить
<b>Ожидаемый результат:</b> Сообщение об ошибке

⚠️ <u>ТЕСТ-КЕЙС 3: ГРАНИЧНЫЙ СЛУЧАЙ</u>
<b>Цель:</b> Максимальные данные
<b>Шаги:</b>
1. Ввести много текста
2. Проверить обработку
<b>Ожидаемый результат:</b> Корректная работа

─────────────────────────────
<i>🤖 Сгенерировано QA Assistant AI</i>
        `;
    }, 1500);
}

// Генератор баг-репортов
function generateBugReport() {
    const title = document.getElementById('bugTitle').value;
    const steps = document.getElementById('bugSteps').value;
    const expected = document.getElementById('expected').value;
    const actual = document.getElementById('actual').value;
    const severity = document.getElementById('severity').value;
    const priority = document.getElementById('priority').value;
    const output = document.getElementById('bugOutput');
    
    if (!title.trim()) {
        output.innerHTML = '<div style="color: #dc2626; padding: 20px; text-align: center;">⚠️ Введите описание проблемы</div>';
        return;
    }
    
    output.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Создаем баг-репорт...</div>';
    
    setTimeout(() => {
        output.innerHTML = `
🐛 <b>БАГ-РЕПОРТ</b>
─────────────────────────────
<b>Title:</b> ${title}

<b>Environment:</b>
• Браузер: Chrome 122
• ОС: Windows 11
• Устройство: Desktop

<b>Steps to Reproduce:</b>
${steps || '1. [Опишите шаги воспроизведения]'}

<b>Expected Result:</b>
${expected || '[Что должно было произойти]'}

<b>Actual Result:</b>
${actual || '[Что произошло на самом деле]'}

<b>Severity:</b> ${severity}
<b>Priority:</b> ${priority}

<b>Attachments:</b> [Скриншот/видео/логи]

─────────────────────────────
<i>🤖 Создано через QA Assistant AI</i>
        `;
    }, 1500);
}

// Копирование результата
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

// Мобильное меню
document.querySelector('.menu-btn').addEventListener('click', function() {
    const nav = document.querySelector('.nav-links');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.querySelector('.nav-links').style.display = 'none';
        }
    });
});