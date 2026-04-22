const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً مصرياً طويلاً ومحترفاً لقسم "${randomCategory}" لموقع "الحدث المصري".
    التعليمات:
    1. العنوان: يجب أن يكون جذاباً جداً.
    2. المحتوى: مقال دسم (6 جمل طويلة مفصلة).
    3. صورة الخبر: اختر كلمة واحدة فقط بالإنجليزية (Search Term) تعبر بدقة عن العنوان الذي كتبته (مثلاً لو العنوان عن محمد صلاح اختر كلمة "Salah" أو "Liverpool").
    
    الرد كود HTML فقط بهذا التنسيق حصراً:
    <div class="news-card">
        <div class="card-img-wrapper">
            <img src="https://loremflickr.com/800/500/{KEYWORD}" alt="صورة الخبر" onerror="this.src='https://via.placeholder.com/800x500/002b5b/ffffff?text=الحدث+المصري'">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3 class="news-title">العنوان هنا</h3>
            <p class="news-text">المحتوى هنا...</p>
            <a href="#" class="btn-read">إقرأ التفاصيل الكاملة</a>
        </div>
    </div>
    
    * ملاحظة: استبدل {KEYWORD} بالكلمة الإنجليزية التي تعبر عن العنوان.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5 // تقليل الحرارة لضمان اختيار كلمات منطقية
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // قراءة الملف الحالي
        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            // إضافة المقال الجديد في بداية الشبكة
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر المقال بنجاح بصورة مرتبطة بالعنوان!");
        }
    } catch (e) {
        console.error("❌ فشل الأكشن:", e.message);
        process.exit(1);
    }
}
generate();
