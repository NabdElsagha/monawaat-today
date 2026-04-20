const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    
    // هنستخدم Groq لأنه شغال في مصر بامتياز ومجاني
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const data = {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: "اكتب مقالاً طويلاً باللغة العربية عن أهمية التكنولوجيا في حياة الطلاب بتنسيق HTML." }]
    };

    try {
        console.log("جاري التوليد باستخدام المحرك البديل (Groq)...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const text = result.choices[0].message.content;

        if (!fs.existsSync('./articles')) fs.mkdirSync('./articles');
        fs.writeFileSync(`articles/post-${Date.now()}.html`, text.replace(/```html|```/g, ""));
        
        console.log("✅ أخيراً! اشتغل والمقال نزل.");
    } catch (e) {
        console.error("❌ حتى البديل فيه مشكلة:", e.message);
        process.exit(1);
    }
}
generate();
