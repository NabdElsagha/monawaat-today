const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // استخدام مصدر صور موثوق جداً وسريع مع رقم عشوائي لضمان التغيير
    const imageID = Math.floor(Math.random() * 1000);
    const imageUrl = `https://fastly.picsum.photos/id/${imageID % 500}/800/500.jpg?hmac=demo`;

    const prompt = `اكتب مقالاً إخبارياً مصرياً دسماً واحترافياً لقسم "${randomCategory}" في موقع "الحدث المصري".
    التعليمات:
    1. العنوان: جذاب جداً واحترافي (Catchy).
    2. المحتوى: مقال طويل نسبياً (فقرتين كبار) بأسلوب صحفي راقي.
    3. التنسيق: HTML بسيط ونظيف جداً يريح العين على الموبايل.
    4. ابتعد تماماً عن أي محتوى مسيء أو عناوين مضللة.

    الرد كود HTML فقط:
    <div class="news-card" style="margin-bottom:30px; background:#fff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); overflow:hidden;">
        <img src="${imageUrl}" style="width:100%; height:250px; object-fit:cover; display:block;" alt="الحدث">
        <div style="padding:20px;">
            <span class="tag" style="background:#c5a059; color:#fff; padding:3px 10px; font-size:12px; border-radius:3px;">${randomCategory}</span>
            <h3 style="color:#002b5b; font-size:1.4rem; margin:15px 0; line-height:1.4;">عنوان الخبر هنا</h3>
            <p style="color:#444; line-height:1.7; font-size:1rem;">محتوى الخبر المفصل الذي يملأ العين ويقدم معلومة مفيدة...</p>
            <a href="#" class="btn-read" style="color:#c5a059; text-decoration:none; font-weight:bold; display:inline-block; margin-top:10px;">إقرأ المزيد ←</a>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6
            })
        });

        const result = await response.json();
        let newCard = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + newCard);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم استعادة النظام ونشر المقال بنجاح!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
