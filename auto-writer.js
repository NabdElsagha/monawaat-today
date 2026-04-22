const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // هنا بنطلب من البوت يختار الكلمة الدلالية بنفسه
    const prompt = `اكتب مقالاً إخبارياً مصرياً طويلاً ومحترفاً لقسم "${randomCategory}" لموقع "الحدث المصري".
    التعليمات:
    1. العنوان: جذاب جداً.
    2. المحتوى: مقال دسم (6 جمل طويلة).
    3. الكلمة المفتاحية للصورة: اختر كلمة واحدة بالإنجليزية تعبر بدقة عن محتوى الخبر (مثل: economy, technology, football, museum).
    
    الرد كود HTML فقط بهذا التنسيق:
    <div class="news-card">
        <div class="card-img-wrapper">
            <img src="https://loremflickr.com/800/500/{KEYWORD}" alt="صورة الخبر" onerror="this.src='https://via.placeholder.com/800x500/002b5b/ffffff?text=الحدث+المصري'">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3>عنوان الخبر هنا</h3>
            <p>تفاصيل الخبر هنا...</p>
            <a href="#" class="btn-read">إقرأ التفاصيل الكاملة</a>
        </div>
    </div>
    
    * ملاحظة: استبدل {KEYWORD} بالكلمة التي اخترتها بالإنجليزية.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ المقال نزل بصورة ذكية!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
