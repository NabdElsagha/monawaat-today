const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["سياسة دولية", "الاقتصاد", "حوادث عامة", "تكنولوجيا", "رياضة", "منوعات"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً صحفياً احترافياً لقسم "${randomCategory}" في موقع "الحدث المصري".
    الضوابط:
    1. السياسة والحوادث: شأن دولي فقط (عالمي) وممنوع ذكر أي رموز سياسية داخلية مصرية.
    2. الأسلوب: رصين، بشري، وطويل (8 جمل).
    3. صورة الخبر: اختر كلمة إنجليزية واحدة تعبر عن جوهر العنوان (مثل: Tech, Global, Sports, Gold).

    الرد يكون كود HTML فقط بهذا الشكل:
    <div class="news-card">
        <div class="card-img-wrapper">
            <span class="category-badge">${randomCategory}</span>
            <img src="https://loremflickr.com/1000/600/{KEYWORD}?random=${Math.random()}" alt="الحدث">
        </div>
        <div class="card-content">
            <h3>العنوان الصحفي هنا</h3>
            <p>نص التقرير الإخباري هنا...</p>
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
            // إضافة المقال الجديد في المقدمة
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر الخبر بنجاح.");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
