const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["World", "Business", "Tech", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً حصرياً لبراند "ENB" في قسم "${randomCat}".
    المحتوى: تريند عالمي مثير وجذاب.
    الطول: 40 جملة (5 جمل مقدمة، 35 جملة تفاصيل داخل div class="full-article").
    
    الرد كود HTML فقط بهذا التنسيق:
    <div class="article-card" data-category="${randomCat}">
        <div class="card-img-wrap">
            <span class="category-badge">${randomCat}</span>
            <img src="https://images.unsplash.com/photo-1585829365234-754faaf9a09d?auto=format&fit=crop&w=800&q=80" class="card-img" alt="News">
        </div>
        <div class="card-body">
            <h3>عنوان الخبر هنا</h3>
            <p>أول 5 جمل تشويقية هنا...</p>
            <div class="full-article">باقي الـ 35 جملة هنا لزيادة المحتوى لـ AdSense...</div>
            <button class="read-btn" onclick="toggleRead(this)">Read More / إقرأ المزيد</button>
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
        
        // إصلاح خطأ الـ undefined (reading '0')
        if (!result.choices || result.choices.length === 0) {
            throw new Error("API returned no data");
        }

        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();
        
        // تغيير معرف الصورة لضمان التجديد
        const randomID = Math.floor(Math.random() * 500);
        content = content.replace(/photo-\d+/, `photo-${1585000000000 + randomID}`);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ News updated successfully for ENB.");
        }
    } catch (e) {
        console.error("Critical Error: " + e.message);
        process.exit(1);
    }
}
generate();
