const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const data = {
        contents: [{
            parts: [{ text: "اكتب مقالاً طويلاً ومنوعاً باللغة العربية عن أهم تريند في مصر اليوم بتنسيق HTML جذاب." }]
        }]
    };

    try {
        console.log("جاري طلب المقال مباشرة من سيرفرات جوجل...");
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
            fs.writeFileSync(fileName, articleText);
            
            console.log("✅ تم بنجاح: " + fileName);
        } else {
            console.error("❌ خطأ في الرد من جوجل:", JSON.stringify(result));
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ خطأ فني:", error.message);
        process.exit(1);
    }
}

generate();
