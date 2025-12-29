const API_KEY = 'sk-db2a9896c81a4cc18c5bd77a2b83a38e';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { prompt, type } = data;
    
    let systemPrompt = '';
    if (type === 'test-design') {
      systemPrompt = 'Ты — опытный QA инженер. Создай подробные тест-кейсы на русском языке. Отвечай в формате Markdown.';
    } else {
      systemPrompt = 'Ты — QA lead. Создай профессиональный баг-репорт на русском языке. Отвечай в формате Markdown.';
    }
    
    const response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      payload: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000
      })
    });
    
    const result = JSON.parse(response.getContentText());
    const content = result.choices[0].message.content;
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        result: content 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}