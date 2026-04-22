const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // طلب مقال مع تحديد القسم بشكل إلزامي
    const prompt = `اكتب مقالاً إخبارياً مصرياً احترافياً. 
    يجب أن يبدأ الرد بكلمة واحدة فقط تحدد القسم من بين (أخبار، تكنولوجيا، رياضة) ثم سطر جديد، ثم العنوان، ثم المحتوى بتنسيق HTML جذاب.`;

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

        // تحليل المحتوى لاستخراج التصنيف والعنوان
        const lines = rawContent.split('\n');
        const category = lines[0].includes('تكنولوجيا') ? 'تكنولوجيا' : lines[0].includes('رياضة') ? 'رياضة' : 'أخبار';
        const content = lines.slice(1).join('\n');

        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
        const fileName = `post-${Date.now()}.html`;
        
        // حفظ ملف المقال بتنسيق داخلي أنيق
        const articleHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>
            body { font-family: 'Segoe UI', Tahoma; line-height: 1.8; max-width: 800px; margin: auto; padding: 30px; background: #f9f9f9; }
            .content { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            h1 { color: #2c3e50; border-right: 5px solid #e74c3c; padding-right: 15px; }
            .back-btn { display: inline-block; margin-top: 20px; color: #3498db; text-decoration: none; font-weight: bold; }
        </style></head><body><div class="content">${content}<a href="../index.html" class="back-btn">← العودة للرئيسية</a></div></body></html>`;

        fs.writeFileSync(`./articles/${fileName}`, articleHtml);

        // إعادة بناء الصفحة الرئيسية المقسمة لأقسام
        buildMainDashboard();
        console.log("✅ تم تحديث بوابة نبض الصاغة بنجاح!");
    } catch (e) { console.error("خطأ في النظام:", e.message); process.exit(1); }
}

function buildMainDashboard() {
    const files = fs.readdirSync('./articles').filter(f => f.endsWith('.html')).reverse();
    
    // دالة لإنشاء كروت المقالات
    const createCards = (num) => files.slice(0, num).map(file => `
        <div class="news-card">
            <h4>تغطية إخبارية جديدة</h4>
            <p>متابعة تحليلية لأهم الأحداث الجارية في هذا السياق...</p>
            <a href="articles/${file}">عرض المقال الكامل</a>
        </div>`).join('');

    const dashboardHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نبض الصاغة | البوابة الإخبارية الشاملة</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #eceff1; margin: 0; color: #263238; }
            header { background: linear-gradient(135deg, #1a237e, #0d47a1); color: white; padding: 40px 20px; text-align: center; }
            .nav-bar { background: #fff; padding: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); sticky; top: 0; }
            .container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
            .section-header { display: flex; align-items: center; margin-top: 40px; margin-bottom: 20px; }
            .section-header h2 { margin: 0; color: #1a237e; flex-grow: 1; border-right: 6px solid #d32f2f; padding-right: 15px; }
            .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
            .news-card { background: white; border-radius: 10px; padding: 25px; box-shadow: 0 6px 15px rgba(0,0,0,0.05); transition: 0.3s; position: relative; overflow: hidden; }
            .news-card:hover { transform: translateY(-8px); box-shadow: 0 12px 25px rgba(0,0,0,0.1); }
            .news-card h4 { margin-top: 0; color: #1a237e; font-size: 1.2em; }
            .news-card a { display: block; margin-top: 15px; color: #d32f2f; text-decoration: none; font-weight: bold; border: 1px solid #d32f2f; padding: 8px; text-align: center; border-radius: 5px; }
            .news-card a:hover { background: #d32f2f; color: white; }
        </style>
    </head>
    <body>
        <header>
            <h1>بوابة نبض الصاغة</h1>
            <p>تغطية شاملة تدار بتقنيات الذكاء الاصطناعي</p>
        </header>
        <div class="nav-bar">الرئيسية | أخبار مصر | تكنولوجيا | رياضة | اقتصاد</div>
        <div class="container">
            <div class="section-header"><h2>🔴 آخر الأخبار</h2></div>
            <div class="grid-layout">${createCards(3)}</div>
            
            <div class="section-header"><h2>💻 التكنولوجيا والعلوم</h2></div>
            <div class="grid-layout">${createCards(3)}</div>

            <div class="section-header"><h2>🌍 منوعات وتريند</h2></div>
            <div class="grid-layout">${createCards(6)}</div>
        </div>
    </body>
    </html>`;

    fs.writeFileSync('index.html', dashboardHtml);
}
generate();
