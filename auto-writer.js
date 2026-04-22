const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: "اكتب مقالاً إخبارياً مصرياً قصيراً جداً بتنسيق HTML جذاب." }]
            })
        });

        const result = await response.json();
        const content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
        const fileName = `post-${Date.now()}.html`;
        fs.writeFileSync(`./articles/${fileName}`, content);

        // تحديث الواجهة فوراً
        updateHome();
    } catch (e) { process.exit(1); }
}

function updateHome() {
    const files = fs.readdirSync('./articles').filter(f => f.endsWith('.html')).reverse();
    
    // تصميم "عالمي" حقيقي هيظهر غصب عن المتصفح
    const cards = files.slice(0, 6).map(file => `
        <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 10px 20px rgba(0,0,0,0.1); border-top:5px solid #e74c3c;">
            <h3 style="color:#2c3e50;">تغطية إخبارية حصرية</h3>
            <p style="color:#7f8c8d;">تم تحديث هذا المحتوى آلياً بواسطة بوت نبض الصاغة.</p>
            <a href="articles/${file}?v=${Date.now()}" style="background:#e74c3c; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">اقرأ الآن</a>
        </div>`).join('');

    const indexHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <title>بوابة نبض الصاغة الجديدة</title>
        <style>
            body { font-family: sans-serif; background: #f0f2f5; padding: 40px; margin: 0; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: auto; }
            header { text-align: center; margin-bottom: 50px; background: #2c3e50; color: white; padding: 40px; border-radius: 20px; }
        </style>
    </head>
    <body>
        <header><h1>بوابة نبض الصاغة - النسخة الاحترافية</h1></header>
        <div class="grid">${cards}</div>
    </body>
    </html>`;

    fs.writeFileSync('index.html', indexHtml);
}
generate();
