const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // رابط صورة مباشر واحترافي يتغير مع كل خبر لضمان الظهور
    const imageUrl = `https://images.unsplash.com/photo-1504711432869-5d5932e22196?auto=format&fit=crop&w=800&q=80&sig=${Date.now()}`;

    // برومبت صارم لضمان الجودة والحياد والمحتوى الطويل
    const prompt = `اكتب مقالاً إخبارياً مصرياً طويلاً ومفصلاً لقسم "${randomCategory}" في منصة "الحدث المصري".
    شروط هامة:
    1. العنوان: يجب أن يكون جذاباً جداً (Catchy) واحترافياً دون أي إساءة للدولة أو مؤسساتها.
    2. المحتوى: اكتب ملخصاً وافياً (لا يقل عن 4 جمل طويلة) يعطي القارئ معلومة حقيقية.
    3. اللغة: لغة عربية صحيحة وسليمة.
    الرد يجب أن يكون كود HTML فقط بهذا التنسيق:
    <div class="news-card">
        <div class="card-img">
            <img src="${imageUrl}" style="width:100%; height:250px; object-fit:cover;" alt="الحدث المصري">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3 style="color:#002b5b; font-size:1.6rem; margin-bottom:15px;">عنوان الخبر هنا</h3>
            <p style="line-height:1.8; color:#444;">تفاصيل الخبر الطويلة والمفصلة هنا...</p>
            <a href="#" class="btn-read">اقرأ التفاصيل الكاملة</a>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6 // تقليل الابتكار لضمان الجدية والرصانة
            })
        });

        const result = await response.json();
        let newCard = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + newCard);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر خبر احترافي جديد بصورة واضحة!");
        }
    } catch (e) {
        console.error("❌ خطأ:", e.message);
        process.exit(1);
    }
}
generate();
