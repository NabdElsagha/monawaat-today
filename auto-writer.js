const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // قائمة الأقسام الكاملة
    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً احترافياً لبراند "ENB" في قسم "${randomCat}". 
    إذا كان القسم "Trending"، اختر موضوعاً عالمياً ساخناً ومثيراً للجدل.
    اللغة: العربية (للمحتوى) والإنجليزية (للتصنيفات).
    الطول: 40 جملة (5 جمل مقدمة، 35 جملة تفاصيل داخل div class="full-article").
    
    الرد كود HTML فقط بهذا التنسيق (بدون مارك داون):
    <div class="article-card" data-category="${randomCat}">
        <div class="card-img-wrap">
            <span class="badge ${randomCat === 'Trending' ? 'badge-trend' : 'badge-normal'}">${randomCat}</span>
            <img src="https://images.unsplash.com/photo-1585829365234-754faaf9a09d" class="card-img">
        </div>
        <div class="card-body">
            <h3>عنوان الخبر هنا</h3>
            <p>مقدمة المقال (5 جمل) هنا...</p>
            <div class="full-article">بقية المقال (35 جملة) هنا لزيادة المحتوى لـ AdSense...</div>
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
                temperature: 0.8
            })
        });

        const result = await response.json();
        
        // منع خطأ reading '0'
        if (!result.choices || result.choices.length === 0) {
            throw new Error("No response from AI API");
        }

        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();
        
        // توليد رابط صورة عشوائي جديد
        const randomPhotoID = Math.floor(Math.random() * 1000);
        content = content.replace(/photo-\d+/, `photo-1585${randomPhotoID}000000-0`);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            
            // تحديث شريط التيكر بعنوان الخبر الأخير
            const titleMatch = content.match(/<h3>(.*?)<\/h3>/);
            if (titleMatch) {
                const newTitle = titleMatch[1];
                indexContent = indexContent.replace(/id="liveTicker">.*?<\/div>/, `id="liveTicker"> عاجل: ${newTitle} ... </div>`);
            }

            fs.writeFileSync('index.html', indexContent);
            console.log("✅ Article published to ENB: " + randomCat);
        }
    } catch (e) {
        console.error("Publication Error: " + e.message);
        process.exit(1);
    }
}
generate();
