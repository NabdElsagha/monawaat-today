const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // تغيير الرابط لمصدر مختلف وأكثر استقراراً مع إضافة رقم عشوائي لكسر الكاش
    const randomID = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${randomID}/800/500`;

    const prompt = `اكتب مقالاً إخبارياً مصرياً طويلاً ومفصلاً لقسم "${randomCategory}" في منصة "الحدث المصري".
    التعليمات:
    1. العنوان: جذاب واحترافي وإيجابي تماماً (Catchy Headline).
    2. المحتوى: لا يقل عن 5 جمل طويلة تشرح الخبر بالتفصيل.
    3. الرد يكون كود HTML فقط.
    
    التنسيق المطلوب:
    <div class="news-card">
        <div class="card-img">
            <img src="${imageUrl}" alt="الحدث المصري" loading="lazy" style="width:100%; height:250px; display:block; object-fit:cover; background:#eee;">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3 style="color:#002b5b; font-size:1.5rem; line-height:1.4; margin:15px 0;">عنوان الخبر</h3>
            <p style="color:#555; line-height:1.8; font-size:1.05rem;">تفاصيل الخبر المفصلة هنا...</p>
            <a href="#" class="btn-read">التفاصيل الكاملة</a>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5 
            })
        });

        const result = await response.json();
        let newCard = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + newCard);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ المقال الجديد نزل بالصورة!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
