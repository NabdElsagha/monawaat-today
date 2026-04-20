const fs = require('fs');

async function generate() {
    // تنظيف المفتاح تماماً
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    
    // استخدام gemini-pro بدلاً من flash لأنه أضمن في الاستجابة حالياً
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const data = {
        contents: [{
            parts: [{ text: "اكتب مقالاً طويلاً باللغة العربية عن السياحة في مصر بتنسيق HTML." }]
        }]
    };

    try {
        console.log("محاولة أخيرة باستخدام gemini-pro...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            const articleText = result.candidates[0].content.parts[0].text;
            if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
            fs.writeFileSync(`articles/post-${Date.now()}.html`, articleText.replace(/```html|```/g, ""));
            console.log("✅ أخيراً! تم النجاح.");
        } else {
            console.error("الرد من جوجل:", JSON.stringify(result));
            process.exit(1);
        }
    } catch (e) {
        console.error("خطأ:", e.message);
        process.exit(1);
    }
}
generate();
