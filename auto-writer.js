const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    // الأقسام المعتمدة في التصميم الجديد
    const categories = ["أخبار عالمية", "اقتصاد", "حوادث", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً صحفياً احترافياً لقسم "${randomCategory}" لموقع "الحدث المصري".
    
    التعليمات الصارمة:
    1. الموضوع: ركز على الشأن الدولي أو الأخبار العامة (ممنوع تماماً أي سياسة داخلية مصرية).
    2. الأمان: المحتوى يجب أن يكون آمناً تماماً لسياسات Google AdSense.
    3. التفاصيل: المقال يجب أن يكون دسماً (8 جمل طويلة) بأسلوب صحفي رصين.
    4. الصورة: اختر كلمة إنجليزية واحدة تعبر عن الخبر (مثل: Business, Tech, Galaxy, Stadium).

    الرد كود HTML فقط بهذا التنسيق الاحترافي:
    <div class="news-card">
        <div class="card-img">
            <span class="badge">${randomCategory}</span>
            <img src="https://loremflickr.com/1000/600/{KEYWORD}?random=${Math.random()}" alt="الحدث">
        </div>
        <div class="card-body">
            <h3>العنوان الصحفي هنا</h3>
            <p>محتوى الخبر هنا بأسلوب تحليلي جذاب...</p>
            <button class="btn-more" onclick="location.reload()">إقرأ المزيد</button>
        </div>
    </div>`;

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
                temperature: 0.6
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            // إضافة الخبر الجديد فوراً تحت عنوان القسم
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log(`✅ تم نشر خبر بروفيشنال في قسم [${randomCategory}] بصورة فريدة.`);
        }
    } catch (e) {
        console.error("خطأ تقني:", e);
        process.exit(1);
    }
}
generate();
