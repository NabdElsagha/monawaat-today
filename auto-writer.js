const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار عالمية", "اقتصاد", "حوادث", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // كلمات بحث بالإنجليزية لتحسين دقة الصور من Unsplash
    const imgKeywords = { "أخبار عالمية": "global,news", "اقتصاد": "finance,gold", "حوادث": "police,fire", "تكنولوجيا": "technology,ai", "رياضة": "stadium,football" };
    const searchWord = imgKeywords[randomCategory];

    const prompt = `اكتب مقالاً صحفياً احترافياً باللغة العربية لقسم "${randomCategory}" لموقع "الحدث المصري".
    الضوابط: شأن دولي فقط، ممنوع السياسة الداخلية المصرية، أسلوب رصين ودسم (8 جمل).
    الرد كود HTML فقط:
    <div class="news-card">
        <div class="card-img">
            <span class="badge">${randomCategory}</span>
            <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80&sig=${Math.floor(Math.random() * 999999)}" alt="خبر">
        </div>
        <div class="card-body">
            <h3>العنوان الصحفي هنا</h3>
            <p>محتوى الخبر هنا بأسلوب جذاب...</p>
            <button class="btn-more" onclick="location.reload()">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // تحديث رابط الصورة بكود فريد جداً لضمان عدم التكرار
        const uniqueID = Date.now() + Math.floor(Math.random() * 1000);
        content = content.replace(/sig=\d+/, `sig=${uniqueID}`);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم النشر بصورة فريدة.");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
