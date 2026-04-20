const fs = require('fs');

async function generate() {
    // تنظيف المفتاح تماماً من أي مسافات أو حروف خفية
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    
    // استخدام الإصدار v1 المستقر بدلاً من v1beta
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const data = {
        contents: [{
            parts: [{ text: "اكتب مقالاً إخبارياً طويلاً باللغة العربية عن موضوع رائج اليوم في مصر، استخدم تنسيق HTML بفقرات h2 و p." }]
        }]
    };

    try {
        console.log("جاري الاتصال بسيرفرات جوجل المستقرة (v1)...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            const articleText = result.candidates[0].content.parts[0].text;
            
            if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
            const fileName = `articles/post-${Date.now()}.html`;
            
            // تنظيف النص الناتج من علامات الـ Markdown إذا وجد
            const cleanHtml = articleText.replace(/```html|```/g, "");
            
            fs.writeFileSync(fileName, cleanHtml);
            console.log("✅ نجاح باهر! تم إنشاء الملف: " + fileName);
        } else {
            console.error("❌ جوجل ردت بخطأ: ", JSON.stringify(result));
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ فشل الاتصال: ", error.message);
        process.exit(1);
    }
}

generate();
