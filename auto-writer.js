const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً حقيقياً لبراند "ENB" في قسم "${randomCat}".
    المطلوب:
    1. موضوع عن شخصية مشهورة أو تريند عالمي حقيقي (مثل محمد صلاح، ميسي، إيلون ماسك، الذكاء الاصطناعي).
    2. استخرج "كلمة مفتاحية واحدة بالإنجليزي" للشخصية أو الموضوع.
    3. المقال 40 جملة حصرية بدون تكرار.
    
    الرد كود HTML فقط:
    <div class="article-card" data-category="${randomCat}">
        <div class="card-img-wrap">
            <span class="badge ${randomCat === 'Trending' ? 'badge-trend' : 'badge-normal'}">${randomCat}</span>
            <img src="https://loremflickr.com/800/600/[KEYWORD]?random=${Math.random()}" class="card-img" alt="News">
        </div>
        <div class="card-body">
            <h3>عنوان الخبر باللغة العربية</h3>
            <p>مقدمة الخبر (5 جمل)...</p>
            <div class="full-article">التفاصيل الكاملة (35 جملة دسمة)...</div>
            <button class="read-btn" onclick="toggleRead(this)">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama3-8b-8192", // موديل خفيف عشان ميطلعش Error
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const result = await response.json();
        if (!result.choices) throw new Error("API Limit");

        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            // إضافة الخبر الجديد في أول القائمة
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ New Smart Article Added!");
        }
    } catch (e) {
        console.error("Error: " + e.message);
        process.exit(1);
    }
}
generate();
