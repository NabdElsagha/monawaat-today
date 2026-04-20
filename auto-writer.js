const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    
    // محرك Groq القوي والبديل لجوجل في مصر
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const data = {
        model: "llama-3.1-8b-instant", // موديل أحدث وأسرع
        messages: [{ 
            role: "user", 
            content: "اكتب مقالاً إخبارياً طويلاً باللغة العربية عن تريند اليوم في مصر بتنسيق HTML جذاب." 
        }],
        temperature: 0.7
    };

    try {
        console.log("جاري محاولة التوليد الأخيرة...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // فحص الرد للتأكد من وجود بيانات
        if (result.choices && result.choices.length > 0) {
            let articleText = result.choices[0].message.content;
            
            // تنظيف النص من أي زوائد
            articleText = articleText.replace(/```html|```/g, "").trim();

            if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
            const fileName = `articles/post-${Date.now()}.html`;
            fs.writeFileSync(fileName, articleText);
            
            console.log("✅ مبروك يا هندسة! المقال اتعمل: " + fileName);
        } else {
            console.error("❌ السيرفر رد بس مفيش مقال. التفاصيل:", JSON.stringify(result));
            process.exit(1);
        }
    } catch (e) {
        console.error("❌ فشل نهائي:", e.message);
        process.exit(1);
    }
}

generate();
