const fs = require('fs');

async function generate() {
    // جلب مفتاح الأي بي آي من البيئة المحيطة
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // تصنيفات المحتوى الصحفي
    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // التعليمات لإخراج محتوى صحفي بشري 100%
    const prompt = `اكتب مقالاً إخبارياً صحفياً احترافياً لقسم "${randomCategory}" في موقع "الحدث المصري".
    
    التعليمات الصارمة:
    1. الأسلوب: صحفي رصين، جاد، وموضوعي (يمنع ذكر أي إشارة للذكاء الاصطناعي أو الآلية).
    2. العنوان: صياغة صحفية جذابة وقوية.
    3. المحتوى: 8 جمل طويلة مفصلة تعطي تفاصيل دقيقة (أرقام، مواقع، أحداث).
    4. البحث عن الصورة: اختر كلمة واحدة بالإنجليزية تعبر بدقة عن "موضوع العنوان" (مثال: لو العنوان عن الذهب اختر Gold، لو عن محمد صلاح اختر Salah).
    
    الرد كود HTML فقط بهذا التنسيق حصراً:
    <div class="news-card">
        <div class="card-img-wrapper">
            <img src="https://loremflickr.com/1000/600/{KEYWORD}" alt="الحدث المصري" onerror="this.src='https://via.placeholder.com/1000/600/002b5b/ffffff?text=الحدث+المصري'">
        </div>
        <div class="card-content">
            <span class="tag">${randomCategory}</span>
            <h3>العنوان الصحفي هنا</h3>
            <p>نص التقرير الإخباري المفصل هنا...</p>
            <button class="btn-read" onclick="location.reload()">إقرأ التقرير الكامل</button>
        </div>
    </div>
    
    * ملاحظة: استبدل {KEYWORD} بالكلمة الإنجليزية المناسبة للعنوان.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5 // درجة حرارة منخفضة لضمان الالتزام بالواقعية والصور المنطقية
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // قراءة ملف الإندكس لإضافة الخبر الجديد
        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid" id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            // إضافة الخبر الجديد في أول القائمة بعد الماركر مباشرة
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر التقرير الصحفي بنجاح وبصورة مطابقة للحدث!");
        } else {
            console.log("❌ لم يتم العثور على مكان إضافة الأخبار في ملف index.html");
        }
    } catch (e) {
        console.error("❌ خطأ في النظام:", e.message);
        process.exit(1);
    }
}

generate();
