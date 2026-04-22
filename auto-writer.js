const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const prompt = `اكتب مقالاً إخبارياً احترافياً باللغة العربية عن موضوع تريند حالياً. 
    استخدم تنسيق HTML جذاب للعناوين والفقرات فقط. ابدأ بـ H1 للعنوان الرئيسي.`;

    try {
        console.log("جاري إنتاج المحتوى الاحترافي...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const result = await response.json();
        const content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // 1. استخراج العنوان من أول H1
        const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1] : "مقال جديد";

        // 2. حفظ المقال بتنسيق فخم
        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
        const timestamp = Date.now();
        const fileName = `post-${timestamp}.html`;
        
        const styledContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: sans-serif; line-height: 1.8; max-width: 800px; margin: auto; padding: 40px; color: #2c3e50; background: #f9f9f9; }
                h1 { color: #e74c3c; border-bottom: 3px solid #e74c3c; padding-bottom: 10px; }
                h2 { color: #2980b9; margin-top: 30px; }
                .back { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #3498db; font-weight: bold; }
            </style>
        </head>
        <body>
            <a href="../index.html" class="back">← العودة للرئيسية</a>
            ${content}
        </body>
        </html>`;

        fs.writeFileSync(`./articles/${fileName}`, styledContent);

        // 3. تحديث الصفحة الرئيسية (النظام العالمي)
        updateMainPage();
        
        console.log("✅ تمت العملية بنجاح!");
    } catch (e) {
        console.error("خطأ:", e.message);
        process.exit(1);
    }
}

function updateMainPage() {
    const files = fs.readdirSync('./articles').filter(f => f.endsWith('.html')).reverse();
    let cardsHtml = '';

    files.slice(0, 12).forEach(file => { // عرض آخر 12 مقال
        const stats = fs.statSync(`./articles/${file}`);
        const date = new Date(stats.mtime).toLocaleDateString('ar-EG');
        
        cardsHtml += `
        <div class="news-card">
            <div class="category">أخبار مصر</div>
            <h3>مقال إخباري رقم ${file.split('-')[1].substring(0,4)}</h3>
            <p>نظرة تحليلية شاملة ومتابعة لأحدث التطورات في هذا السياق...</p>
            <div class="meta">📅 ${date}</div>
            <a href="articles/${file}" class="read-btn">اقرأ التفاصيل</a>
        </div>`;
    });

    const indexHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نبض الصاغة - بوابة المحتوى الذكي</title>
        <style>
            :root { --primary: #2c3e50; --accent: #e74c3c; }
            body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f0f2f5; margin: 0; }
            header { background: var(--primary); color: white; padding: 40px 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .container { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
            .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
            .news-card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-top: 5px solid var(--accent); transition: 0.3s; }
            .news-card:hover { transform: translateY(-10px); }
            .category { color: var(--accent); font-weight: bold; font-size: 0.8em; text-transform: uppercase; margin-bottom: 10px; }
            .news-card h3 { margin: 0 0 15px; font-size: 1.4em; color: var(--primary); }
            .news-card p { color: #7f8c8d; font-size: 0.95em; line-height: 1.6; }
            .meta { font-size: 0.85em; color: #95a5a6; margin: 15px 0; }
            .read-btn { display: block; text-align: center; background: var(--primary); color: white; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
    </head>
    <body>
        <header>
            <h1>بوابة نبض الصاغة</h1>
            <p>منصة إخبارية تدار بالذكاء الاصطناعي على مدار الساعة</p>
        </header>
        <div class="container">
            <div class="news-grid">${cardsHtml}</div>
        </div>
    </body>
    </html>`;

    fs.writeFileSync('index.html', indexHtml);
}

generate();
