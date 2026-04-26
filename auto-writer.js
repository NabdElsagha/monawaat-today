const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار عالمية", "اقتصاد", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً صحفياً "تريند" لقسم "${randomCategory}" لموقع "الحدث المصري".
    التعليمات:
    1. الطول: مقال طويل جداً (حوالي 40 جملة) مقسمة لجزئين.
    2. الهيكل: أول 5 جمل مقدمة، والباقي (35 جملة) تحليل دسم وواقعي.
    3. الأمان: شأن دولي فقط، لا سياسة مصرية.
    4. الصورة: كلمة إنجليزية واحدة مناسبة للخبر.

    الرد HTML فقط بهذا الشكل بالضبط:
    <div class="news-card">
        <div class="card-img-wrapper">
            <img src="https://loremflickr.com/800/500/{KEYWORD}?sig=${Math.random()}" alt="خبر">
        </div>
        <div class="card-content">
            <h3>العنوان هنا</h3>
            <span>أول 5 جمل هنا...</span>
            <span class="more-text"> باقي الـ 35 جملة هنا...</span>
            <button class="btn-read" onclick="toggleReadMore(this)">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم التحديث.");
        }
    } catch (e) {
        console.error("خطأ: " + e.message);
        process.exit(1);
    }
}
generate();
