const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // صورة عشوائية حقيقية تتغير مع كل خبر
    const imageUrl = `https://plus.unsplash.com/premium_photo-1688561384439-e243a83d22d5?q=80&w=800&auto=format&fit=crop&random=${Date.now()}`;

    const prompt = `اكتب مقالاً إخبارياً مصرياً قصيراً وحصرياً لقسم "${randomCategory}" في موقع "الحدث المصري". 
    يجب أن يكون الرد كود HTML فقط بهذا التنسيق:
    <div class="news-card">
        <div class="card-img">
            <img src="${imageUrl}" style="width:100%; height:220px; object-fit:cover;" alt="صورة الخبر">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3>عنوان الخبر بأسلوب صحفي جذاب</h3>
            <p>تفاصيل الخبر بشكل مختصر ومفيد جداً للقارئ المصري...</p>
            <a href="#" class="btn-read">اقرأ المزيد</a>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const result = await response.json();
        let newCard = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + newCard);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم تحديث الواجهة بنجاح!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
