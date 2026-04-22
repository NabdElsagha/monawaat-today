const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const prompt = `اكتب مقالاً احترافياً طويلاً باللغة العربية عن موضوع تريند في مصر. 
    يجب أن يتضمن المقال:
    1. عنواناً جذاباً (H1).
    2. مقدمة مشوقة.
    3. فقرات منظمة بـ (H2).
    4. خاتمة.
    اخرج النتيجة بتنسيق HTML فقط بدون أكواد Markdown.`;

    try {
        console.log("جاري التوليد الاحترافي...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }] })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // 1. حفظ المقال
        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
        const timestamp = Date.now();
        const fileName = `articles/post-${timestamp}.html`;
        
        // إضافة تصميم CSS بسيط لجعل المقال احترافي
        const finalHtml = `
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; direction: rtl; padding: 20px; max-width: 800px; margin: auto; color: #333; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #2980b9; margin-top: 30px; }
            p { margin-bottom: 15px; text-align: justify; }
            .date { color: #7f8c8d; font-size: 0.9em; }
        </style>
        <div class="date">تم النشر في: ${new Date().toLocaleDateString('ar-EG')}</div>
        ${content}`;

        fs.writeFileSync(fileName, finalHtml);

        // 2. تحديث الصفحة الرئيسية (The Smart Index)
        updateIndex();

        console.log("✅ المقال والواجهة جاهزين!");
    } catch (e) {
        console.error("❌ فشل:", e.message);
        process.exit(1);
    }
}

function updateIndex() {
    const files = fs.readdirSync('./articles').filter(f => f.endsWith('.html')).reverse();
    let cardsHtml = '';

    files.forEach(file => {
        const stats = fs.statSync(`./articles/${file}`);
        cardsHtml += `
        <div class="card">
            <h3>مقال جديد</h3>
            <p>تاريخ النشر: ${new Date(stats.mtime).toLocaleDateString('ar-EG')}</p>
            <a href="articles/${file}">اقرأ المزيد</a>
        </div>`;
    });

    const indexTemplate = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>منوعات اليوم - بوابة المحتوى العربي</title>
        <style>
            body { font-family: sans-serif; background: #f4f7f6; margin: 0; padding: 20px; }
            header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1max)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.3s; }
            .card:hover { transform: translateY(-5px); }
            .card h3 { margin: 0 0 10px; color: #2c3e50; }
            .card a { display: inline-block; background: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
    </head>
    <body>
        <header><h1>منوعات اليوم</h1><p>أحدث الأخبار والمقالات بذكاء اصطناعي عالمي</p></header>
        <div class="grid">${cardsHtml}</div>
    </body>
    </html>`;

    fs.writeFileSync('index.html', indexTemplate);
}

generate();
