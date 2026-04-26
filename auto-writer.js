const fs = require('fs');

async function generate() {
    // 1. تعريف قائمة المفاتيح المتاحة عندك في الـ Secrets
    const apiKeys = [
        process.env.GEMINI_API_KEY,      // المفتاح الأول
        process.env.GEMINI_API_KEY_2,    // المفتاح الثاني (تأكد من إضافته في Secrets)
        process.env.GEMINI_API_KEY_3     // مفتاح ثالث لو حابب تفتح على البحري
    ].filter(key => key && key.trim() !== ""); // تصفية المفاتيح الفاضية

    const url = `https://api.groq.com/openai/v1/chat/completions`;
    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب مقالاً إخبارياً حقيقياً لبراند "ENB" في قسم "${randomCat}".
    المطلوب: تريند حقيقي وشخصية مشهورة.
    الرد كود HTML فقط (article-card) بـ 40 جملة حصرية.`;

    // 2. محاولة تشغيل المفاتيح واحد ورا التاني لو حصل خطأ
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

            // لو الـ API شغال تمام
            if (result.choices && result.choices.length > 0) {
                let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();
                let indexContent = fs.readFileSync('index.html', 'utf8');
                const marker = '<div id="newsGrid">';
                
                if (indexContent.includes(marker)) {
                    indexContent = indexContent.replace(marker, marker + '\n' + content);
                    fs.writeFileSync('index.html', indexContent);
                    console.log(`✅ Success with Key #${i + 1}! Article Added.`);
                    return; // نخرج من الدالة بعد النجاح
                }
            } else {
                console.warn(`⚠️ Key #${i + 1} hit a limit or returned no results.`);
            }
        } catch (e) {
            console.error(`❌ Error with Key #${i + 1}: ${e.message}`);
        }

        // لو وصلنا لهنا معناه المفتاح ده فشل، الكود هيكمل للفة اللي بعدها ويجرب المفتاح التالي
    }

    console.error("🚫 All API Keys failed. Please check your limits or keys.");
    process.exit(1);
}

generate();
