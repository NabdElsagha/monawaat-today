const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    
    // الرابط ده هو "المسطرة" اللي هنقيس عليها
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const data = {
        contents: [{ parts: [{ text: "اكتب مقالاً سريعاً عن الذكاء الاصطناعي بتنسيق HTML." }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.candidates) {
            const text = result.candidates[0].content.parts[0].text;
            if (!fs.existsSync('./articles')) fs.mkdirSync('./articles');
            fs.writeFileSync(`articles/test-${Date.now()}.html`, text);
            console.log("✅ أخيرااااااا! اشتغل!");
        } else {
            console.error("❌ المفتاح الجديد لسه فيه مشكلة أو الموديل مش متاح في مصر حالياً بدون VPN.");
            console.log("التفاصيل:", JSON.stringify(result));
            process.exit(1);
        }
    } catch (e) {
        console.error("خطأ:", e.message);
        process.exit(1);
    }
}
generate();
