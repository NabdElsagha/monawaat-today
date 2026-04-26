const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار عالمية", "اقتصاد", "حوادث", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب تقريراً صحفياً تحليلياً ضخماً وواقعياً لقسم "${randomCategory}" لموقع "الحدث المصري".
    التعليمات المهنية:
    1. الهدف: محتوى تريند عالمي، دسم، واقعي (60 جملة كاملة).
    2. الهيكل: أول 5 جمل (مقدمة مثيرة) قبل الزر. باقي الـ 55 جملة (تحليل عميق ومعلومات) بعد الزر.
    3. الأمان: لا تذكر السياسة المصرية الداخلية نهائياً.
    4. الصورة: اختر كلمة إنجليزية دقيقة (AI, Crypto, Space, Football, Fire, Economy).

    الرد كود HTML فقط:
    <div class="news-card">
        <div class="card-img">
            <span class="badge">${randomCategory} - تريند</span>
            <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80&sig=${Math.floor(Math.random() * 99999)}" alt="تريند">
        </div>
        <div class="card-body">
            <h3>عنوان التريند العالمي هنا</h3>
            <p>أول 5 جمل هنا...</p>
            <div class="more-text">باقي الـ 55 جملة من التحليل العميق هنا...</div>
            <button class="btn-more" onclick="toggleReadMore(this)">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        const uniqueID = Date.now();
        content = content.replace(/sig=\d+/, `sig=${uniqueID}`);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم النشر بنجاح.");
        }
    } catch (e) { process.exit(1); }
}
generate();
