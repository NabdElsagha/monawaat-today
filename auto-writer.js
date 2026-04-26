const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً لبراند "ENB" في قسم "${randomCat}".
    المطلوب: تريند حقيقي وشخصية مشهورة حالياً.
    المحتوى: 40 جملة متنوعة بدون تكرار (مقدمة + تفاصيل دسمة + خاتمة).
    اللغة: العربية.
    
    الرد كود HTML فقط (ممنوع مارك داون ممنوع backticks):
    <div class="article-card" data-category="${randomCat}">
        <div class="card-img-wrap">
            <span class="badge ${randomCat === 'Trending' ? 'badge-trend' : 'badge-normal'}">${randomCat}</span>
            <img src="https://loremflickr.com/800/600/${randomCat.toLowerCase()}?random=1" class="card-img" alt="News Image">
        </div>
        <div class="card-body">
            <h3>عنوان الخبر</h3>
            <p>مقدمة الخبر (5 جمل)...</p>
            <div class="full-article">التفاصيل (35 جملة)...</div>
            <button class="read-btn" onclick="toggleRead(this)">Read More / إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8
            })
        });

        const result = await response.json();
        if (!result.choices) throw new Error("API Limit or Error");

        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            // إضافة الخبر الجديد في بداية الشبكة
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            
            // تحديث شريط التيكر
            const titleMatch = content.match(/<h3>(.*?)<\/h3>/);
            if (titleMatch) {
                indexContent = indexContent.replace(/id="liveTicker">.*?<\/div>/, `id="liveTicker"> عاجل: ${titleMatch[1]} ... </div>`);
            }

            fs.writeFileSync('index.html', indexContent);
            console.log("✅ Published: " + randomCat);
        } else {
            console.log("❌ Marker not found in index.html");
        }
    } catch (e) {
        console.error("Error: " + e.message);
        process.exit(1);
    }
}
generate();
