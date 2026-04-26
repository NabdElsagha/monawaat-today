const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار عالمية", "اقتصاد", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // كلمات دلالية للصور لضمان ظهور صور حقيقية
    const keywords = ["business", "technology", "city", "news", "world", "trading"];
    const randomKey = keywords[Math.floor(Math.random() * keywords.length)];

    const prompt = `اكتب مقالاً "تريند" جداً ومثيراً لقسم "${randomCategory}" لموقع "الحدث المصري".
    المحتوى يجب أن يكون:
    1. تريند عالمي (مثلاً: ثورة الذكاء الاصطناعي، أسعار الذهب، استكشاف الفضاء، كرة القدم العالمية).
    2. الطول: 30 جملة دسمة (5 جمل مقدمة عاجلة، و 25 جملة تفاصيل المقال).
    3. الأمان: شأن دولي فقط، ابعد عن السياسة المصرية.

    الرد كود HTML فقط بهذا الشكل:
    <div class="news-card">
        <div class="card-img">
            <img src="https://source.unsplash.com/800x500/?${randomKey}&sig=${Math.random()}" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'" alt="Trend">
        </div>
        <div class="card-body">
            <h3>عنوان التريند المثير هنا</h3>
            <p>أول 5 جمل (الخبر العاجل) هنا...</p>
            <div class="more-text">باقي الـ 25 جملة من التحليل المفصل هنا...</div>
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
            
            // تحديث شريط الأخبار العاجلة بالعنوان الجديد (اختياري لجعل الموقع حيوي)
            const titleMatch = content.match(/<h3>(.*?)<\/h3>/);
            if (titleMatch) {
                const newTitle = " عاجل: " + titleMatch[1] + " ... " ;
                indexContent = indexContent.replace(/id="breakingText">.*?<\/div>/, `id="breakingText">${newTitle}</div>`);
            }

            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم التحديث بنجاح بالتريند الجديد.");
        }
    } catch (e) {
        console.error("Error: " + e.message);
        process.exit(1);
    }
}
generate();
