const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // قائمة الأقسام الموسعة
    const categories = ["السياسة", "الاقتصاد", "حوادث", "تكنولوجيا", "رياضة", "منوعات", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب تحقيقاً صحفياً احترافياً جداً لقسم "${randomCategory}" في جريدة "الحدث المصري".
    التعليمات:
    1. العنوان: طويل، مثير، وبأسلوب كبار الكتاب.
    2. المحتوى: 8-10 جمل طويلة مليئة بالتفاصيل والتحليل الصحفي.
    3. الصورة: اختر كلمة إنجليزية واحدة تعبر عن جوهر الموضوع.
    
    الرد كود HTML فقط:
    <div class="news-card">
        <div class="card-img-wrapper">
            <span class="category-badge">${randomCategory}</span>
            <img src="https://loremflickr.com/1000/600/{KEYWORD}" alt="الحدث">
        </div>
        <div class="card-content">
            <h3>العنوان الصحفي هنا</h3>
            <p>نص التحقيق المفصل هنا...</p>
            <button class="btn-read" onclick="location.reload()">إقرأ المزيد</button>
        </div>
    </div>`;

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
        const marker = '<div class="news-grid" id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ المقال الاحترافي نزل بنجاح!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
