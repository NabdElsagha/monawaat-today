const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً حقيقياً لبراند "ENB" في قسم "${randomCat}".
    شروط هامة جداً:
    1. ابحث عن تريند حقيقي حالي (شخصية مشهورة أو حدث عالمي ضخم).
    2. استخرج "اسم الشخصية أو الحدث بالإنجليزي" بدقة بالغة لاستخدامه في البحث عن الصور.
    3. المقال يجب أن يكون 40 جملة حصرية بدون أي تكرار، بأسلوب صحفي محترف.
    4. ممنوع كتابة أخبار وهمية عن الموقع نفسه.

    الرد كود HTML فقط بتنسيق دقيق (بدون backticks):
    <div class="article-card" data-category="${randomCat}">
        <div class="card-img-wrap">
            <span class="badge ${randomCat === 'Trending' ? 'badge-trend' : 'badge-normal'}">${randomCat}</span>
            <img src="https://loremflickr.com/800/600/[ENGLISH_KEYWORD]?random=1" class="card-img" alt="News Image">
        </div>
        <div class="card-body">
            <h3>عنوان إخباري حقيقي ومثير</h3>
            <p>مقدمة المقال (5 جمل دسمة)...</p>
            <div class="full-article">التفاصيل (35 جملة متنوعة لرفع جودة المحتوى لـ AdSense)...</div>
            <button class="read-btn" onclick="toggleRead(this)">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama3-8b-8192", // موديل أسرع وأخف
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
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            
            const titleMatch = content.match(/<h3>(.*?)<\/h3>/);
            if (titleMatch) {
                indexContent = indexContent.replace(/id="liveTicker">.*?<\/div>/, `id="liveTicker"> عاجل: ${titleMatch[1]} ... </div>`);
            }

            fs.writeFileSync('index.html', indexContent);
            console.log("✅ Smart Article Published!");
        }
    } catch (e) {
        console.error("Critical Error: " + e.message);
        process.exit(1);
    }
}
generate();
