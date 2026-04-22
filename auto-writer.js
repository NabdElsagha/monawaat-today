const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // البرومبت مخصص لاسم "الحدث المصري" وشكل الكروت الجديد
    const prompt = `اكتب مقالاً إخبارياً مصرياً قصيراً جداً لمنصة "الحدث المصري".
    يجب أن يكون الرد عبارة عن كود HTML فقط بتنسيق كارت (Card) كالتالي:
    <div class="news-card">
        <div class="card-img">📷 صورة الخبر</div>
        <div class="card-content">
            <span class="tag">عاجل</span>
            <h3>عنوان الخبر هنا</h3>
            <p>ملخص سريع للخبر هنا...</p>
            <a href="#" class="btn-read">اقرأ المزيد</a>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const result = await response.json();
        const newCard = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // 1. حفظ المقال كملف منفصل للأرشفة
        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
        const fileName = `post-${Date.now()}.html`;
        fs.writeFileSync(`./articles/${fileName}`, newCard);

        // 2. تحديث الصفحة الرئيسية (index.html)
        let indexContent = fs.readFileSync('index.html', 'utf8');
        
        // البحث عن مكان الـ grid لإضافة الخبر الجديد في البداية
        const gridMarker = '<div class="news-grid">';
        if (indexContent.includes(gridMarker)) {
            indexContent = indexContent.replace(gridMarker, gridMarker + '\n' + newCard);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم تحديث الصفحة الرئيسية بنجاح!");
        }

    } catch (e) {
        console.error("❌ حدث خطأ:", e.message);
        process.exit(1);
    }
}

generate();
