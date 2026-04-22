const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // استخدام رابط صورة مباشر مع رقم عشوائي لضمان التحديث المستمر
    const picId = Math.floor(Math.random() * 100) + 1;
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png`; // رابط تجريبي للتأكد من العرض
    // الرابط الفعلي اللي هنعتمد عليه (احترافي وسريع):
    const finalImg = `https://picsum.photos/800/500?random=${Date.now()}`;

    const prompt = `اكتب مقالاً إخبارياً مصرياً طويلاً ومحترماً لمنصة "الحدث المصري" في قسم "${randomCategory}".
    التعليمات:
    1. العنوان: طويل وجذاب وبعيد عن الإساءة.
    2. المحتوى: فقرتين كاملتين بأسلوب صحفي دسم.
    
    الرد كود HTML فقط:
    <div class="news-card" style="margin-bottom:30px; background:#fff; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05); overflow:hidden; border: 1px solid #eee;">
        <div style="width:100%; height:250px; background:#f0f0f0; overflow:hidden;">
            <img src="${finalImg}" style="width:100%; height:100%; object-fit:cover;" alt="الحدث المصري" onerror="this.src='https://via.placeholder.com/800x500/002b5b/ffffff?text=الحدث+المصري'">
        </div>
        <div style="padding:25px;">
            <span style="background:#c5a059; color:#fff; padding:4px 12px; font-size:12px; border-radius:4px; font-weight:bold;">${randomCategory}</span>
            <h3 style="color:#002b5b; font-size:1.6rem; margin:15px 0; line-height:1.4;">[العنوان]</h3>
            <p style="color:#444; line-height:1.8; font-size:1.1rem; margin-bottom:15px;">[المحتوى]</p>
            <div style="text-align:left;">
                <a href="#" style="color:#c5a059; text-decoration:none; font-weight:bold;">إقرأ المزيد ←</a>
            </div>
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
            console.log("✅ تم النشر بنجاح والصور مؤمنة!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
