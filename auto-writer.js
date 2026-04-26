const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار عالمية", "اقتصاد", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً صحفياً "تريند" ضخماً لقسم "${randomCategory}" لموقع "الحدث المصري".
    المطلوب:
    1. موضوع تريند عالمي حقيقي (مثل: تحركات الفيدرالي، صفقات كروية كبرى، اختراعات AI).
    2. الطول: 35 جملة (5 جمل مقدمة، 30 جملة تفاصيل).
    3. الهيكل: الـ 30 جملة الإضافية داخل <div class="more-text">.
    4. الصورة: استخدم رابط Unsplash بكلمة دلالية مناسبة.

    الرد HTML فقط:
    <div class="news-card">
        <div class="card-img">
            <img src="https://images.unsplash.com/photo-1585829365234-78d9b692e6ad?auto=format&fit=crop&w=800&q=80" alt="News">
        </div>
        <div class="card-body">
            <h3>عنوان التريند المثير هنا</h3>
            <p>أول 5 جمل (المقدمة) هنا...</p>
            <div class="more-text">باقي الـ 30 جملة من التفاصيل والتحليل هنا...</div>
            <button class="btn-more" onclick="toggleReadMore(this)">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            
            // تحديث شريط العاجل بالعنوان
            const titleMatch = content.match(/<h3>(.*?)<\/h3>/);
            if (titleMatch) {
                indexContent = indexContent.replace(/id="breakingTicker">.*?<\/div>/, `id="breakingTicker">${titleMatch[1]} ... </div>`);
            }

            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم تحديث التريند.");
        }
    } catch (e) {
        console.error("Error: " + e.message);
        process.exit(1);
    }
}
generate();
