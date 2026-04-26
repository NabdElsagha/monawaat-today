const fs = require('fs');

async function generate() {
    // ناديت على المفاتيح بأساميها الجديدة (1 و 2)
    const apiKeys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2
    ].filter(key => key && key.trim() !== "");

    const url = `https://api.groq.com/openai/v1/chat/completions`;
    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    // قللنا عدد الجمل شوية لـ 15 جملة عشان المفاتيح متخلصش بسرعة (Limit)
    const prompt = `اكتب مقالاً إخبارياً حقيقياً لبراند "ENB" في قسم "${randomCat}".
    الموضوع: تريند عالمي أو شخصية مشهورة حالياً.
    المحتوى: 15 جملة حصرية واحترافية.
    الرد كود HTML فقط (article-card) وبدون علامات backticks.`;

    for (let i = 0; i < apiKeys.length; i++) {
        const currentKey = apiKeys[i].trim();
        console.log(`🔄 Trying API Key #${i + 1}...`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${currentKey}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192", 
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7
                })
            });

            const result = await response.json();

            if (result.choices && result.choices.length > 0) {
                let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();
                let indexContent = fs.readFileSync('index.html', 'utf8');
                const marker = '<div id="newsGrid">';
                
                if (indexContent.includes(marker)) {
                    // حقن الخبر الجديد
                    indexContent = indexContent.replace(marker, marker + '\n' + content);
                    fs.writeFileSync('index.html', indexContent);
                    console.log(`✅ Success! Key #${i + 1} worked like a charm.`);
                    return; 
                }
            } else {
                console.warn(`⚠️ Key #${i + 1} is exhausted (Limit). Trying next...`);
            }
        } catch (e) {
            console.error(`❌ Error with Key #${i + 1}: ${e.message}`);
        }
    }

    console.error("🚫 All keys (1 & 2) failed. Check your Groq Dashboard.");
    process.exit(1);
}

generate();
