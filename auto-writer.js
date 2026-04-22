const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب تحقيقاً صحفياً مطولاً جداً لقسم "${randomCategory}" في موقع "الحدث المصري".
    التعليمات:
    1. العنوان: طويل، جذاب، واحترافي جداً.
    2. المحتوى: 8 جمل طويلة مفصلة تشرح الخبر من جميع جوانبه.
    3. صورة الخبر: اختر كلمة واحدة بالإنجليزية من العنوان تعبر عن الموضوع (مثل: Cairo, Money, AI, Sports).
    
    الرد كود HTML فقط بهذا الشكل:
    <div class="news-card">
        <div class="card-img-wrapper">
            <img src="https://loremflickr.com/1000/600/{KEYWORD}" alt="الحدث">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3>العنوان هنا</h3>
            <p>المحتوى الدسم هنا...</p>
            <button class="btn-read" onclick="alert('جاري تحميل المقال الكامل...')">إقرأ التحقيق الكامل</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid" id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ المقال الكبير اتنشر والزراير اشتغلت!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
