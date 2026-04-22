const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // طلب مقال مع تحديد القسم
    const prompt = `اكتب مقالاً إخبارياً مصرياً احترافياً. 
    ابدأ المقال بكلمة واحدة فقط تحدد القسم (أخبار أو تكنولوجيا أو رياضة) ثم سطر جديد ثم العنوان ثم المحتوى بتنسيق HTML.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const result = await response.json();
        let rawContent = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // تقسيم المحتوى لاستخراج القسم والعنوان
        const lines = rawContent.split('\n');
        const category = lines[0].includes('أخبار') ? 'أخبار' : lines[0].includes('تكنولوجيا') ? 'تكنولوجيا' : 'منوعات';
        const content = lines.slice(1).join('\n');

        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
        const fileName = `post-${Date.now()}.html`;
        
        // تصميم صفحة المقال الداخلية
        const articleHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>
            body { font-family: 'Segoe UI', Tahoma; line-height: 1.8; max-width: 800px; margin: auto; padding: 30px; background: #f4f4f4; }
            .content { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
            h1 { color: #c0392b; }
            .cat-tag { background: #2980b9; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8em; }
        </style></head><body><div class="content"><span class="cat-tag">${category}</span>${content}<br><a href="../index.html">🏠 العودة للرئيسية</a></div></body></html>`;

        fs.writeFileSync(`./articles/${fileName}`, articleHtml);

        // تحديث الصفحة الرئيسية المقسمة
        updateHome();
        console.log("✅ تم التحديث بنجاح!");
    } catch (e) { console.error(e); process.exit(1); }
}

function updateHome() {
    const files = fs.readdirSync('./articles').filter(f => f.endsWith('.html')).reverse();
    
    // دالة لتوليد الكروت
    const makeCards = (list) => list.map(file => `
        <div class="card">
            <h4>موضوع جديد</h4>
            <a href="articles/${file}">اقرأ المقال الكامل ←</a>
        </div>`).join('');

    const indexHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نبض الصاغة | بوابة المحتوى العربي</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; color: #1c1e21; }
            header { background: #1a2a6c; color: white; padding: 30px; text-align: center; }
            .container { max-width: 1100px; margin: 20px auto; padding: 20px; }
            .section-title { border-right: 5px solid #b21f1f; padding-right: 15px; margin: 40px 0 20px; color: #1a2a6c; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-bottom: 3px solid #b21f1f; }
            .card a { color: #b21f1f; text-decoration: none; font-weight: bold; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <header><h1>بوابة نبض الصاغة الإخبارية</h1><p>ذكاء اصطناعي يغطي الأحداث لحظة بلحظة</p></header>
        <div class="container">
            <h2 class="section-title">🔴 أحدث الأخبار</h2>
            <div class="grid">${makeCards(files.slice(0, 3))}</div>
            
            <h2 class="section-title">💻 تكنولوجيا وعصر رقمي</h2>
            <div class="grid">${makeCards(files.slice(3, 6))}</div>

            <h2 class="section-title">🌟 منوعات وتريند</h2>
            <div class="grid">${makeCards(files.slice(6, 12))}</div>
        </div>
    </body>
    </html>`;

    fs.writeFileSync('index.html', indexHtml);
}
generate();
