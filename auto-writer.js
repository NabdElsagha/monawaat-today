const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // رجعنا كل الأقسام عشان "الهيبة" والشكل الاحترافي
    const categories = ["السياسة", "الاقتصاد", "حوادث", "تكنولوجيا", "رياضة", "منوعات"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً صحفياً احترافياً لقسم "${randomCategory}" في موقع "الحدث المصري".
    
    الخطوط الحمراء (هام جداً):
    1. في قسم السياسة: ركز فقط على السياسة الدولية (أخبار الأمم المتحدة، قمم عالمية، اتفاقيات تجارية دولية).
    2. ممنوع منعاً باتاً التعرض للسياسة الداخلية المصرية أو ذكر أي رموز سياسية محلية.
    3. في قسم الحوادث: ركز على نصائح السلامة أو أخبار الحوادث العامة (مثل حريق في غابة عالمية، أو نصائح مرورية).
    4. اجعل المحتوى "آمن" (Safe Content) وموافق لسياسات Google AdSense.
    5. الأسلوب: رصين، بشري تماماً، وبدون أي إشارة للذكاء الاصطناعي.

    الرد كود HTML فقط:
    <div class="news-card">
        <div class="card-img-wrapper">
            <span class="category-badge">${randomCategory}</span>
            <img src="https://loremflickr.com/1000/600/{KEYWORD}" alt="الحدث">
        </div>
        <div class="card-content">
            <h3>العنوان الصحفي هنا</h3>
            <p>المحتوى الصحفي هنا (8 جمل دسمة)...</p>
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
            console.log(`✅ تم نشر خبر في قسم ${randomCategory} بنجاح وبأمان تام.`);
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
