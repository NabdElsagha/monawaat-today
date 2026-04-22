const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // قائمة المجالات
    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب تحقيقاً صحفياً مطولاً جداً لقسم "${randomCategory}" في موقع "الحدث المصري".
    التعليمات الصارمة:
    1. المحتوى: مقال طويل (أكثر من 300 كلمة) مقسم لفقرات واضحة.
    2. الصور: أريد منك وضع كلمات دلالية بالإنجليزية للصور في الأماكن المخصصة (مثلاً: egypt-economy, football-match).
    3. التنسيق: استخدم HTML جذاب مع صور داخلية متناسقة.
    
    الرد يكون كود HTML فقط بهذا الشكل:
    <div class="news-card" style="grid-column: 1 / -1; max-width: 850px; margin: 0 auto 50px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden;">
        <img src="https://source.unsplash.com/featured/?{KEYWORD1}" style="width:100%; height:400px; object-fit:cover;" alt="صورة رئيسية">
        
        <div style="padding: 40px;">
            <span class="tag" style="background:#c5a059; color:#white; padding:5px 15px; border-radius:4px;">${randomCategory}</span>
            <h1 style="font-size:2.8rem; color:#002b5b; line-height:1.3; margin:20px 0;">[عنوان طويل وجذاب جداً]</h1>
            
            <p style="font-size:1.25rem; line-height:1.9; color:#333; margin-bottom:30px; font-weight:500;">[مقدمة دسمة جداً]</p>
            
            <div style="display:flex; gap:25px; margin:30px 0; align-items:flex-start;">
                <p style="flex:2; font-size:1.1rem; line-height:1.8; color:#555;">[الفقرة الأولى المحللة للخبر بالتفصيل...]</p>
                <img src="https://source.unsplash.com/featured/?{KEYWORD2}" style="flex:1; width:250px; height:180px; border-radius:10px; object-fit:cover;">
            </div>

            <p style="font-size:1.1rem; line-height:1.8; color:#555; margin-bottom:30px;">[الفقرة الثانية التي تحتوي على معلومات إضافية وإحصائيات...]</p>

            <div style="background:#f9f9f9; border-right:5px solid #002b5b; padding:20px; margin:30px 0;">
                <h4 style="margin:0; color:#002b5b;">نقطة تحليلية من "الحدث المصري":</h4>
                <p style="margin:10px 0 0; color:#666; font-style:italic;">[تحليل سريع لمستقبل هذا الخبر]</p>
            </div>

            <p style="font-size:1.1rem; line-height:1.8; color:#555;">[الخاتمة النهائية للموضوع]</p>
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
        let content = result.choices[0].message.content;

        // استبدال الكلمات الدلالية العشوائية بكلمات مرتبطة بالمحتوى
        // البوت سيقوم بملء {KEYWORD} بكلمات مناسبة من اختياره
        let fullArticle = content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + fullArticle);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر التحقيق الصحفي المطور!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
