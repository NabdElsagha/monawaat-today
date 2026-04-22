const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const prompt = `اكتب مقالاً إخبارياً مصرياً قصيراً جداً لمنصة "الحدث المصري".
    يجب أن يكون الرد عبارة عن كود HTML فقط بتنسيق كارت (Card) كالتالي:
    <div class="news-card">
        <div class="card-img">📷 صورة الخبر</div>
        <div class="card-content">
            <span class="tag">عاجل</span>
            <h3>عنوان الخبر هنا</h3>
            <p>ملخص سريع ومثير للخبر...</p>
            <a href="#" class="btn-read">اقرأ المزيد</a>
        </div>
    </div>`;

    try {
        console.log("...جاري الاتصال بالمحرك لتوليد خبر لـ الحدث المصري");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const result = await response.json();
        const newCard = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // 1. قراءة ملف الـ index
        let indexContent = fs.readFileSync('index.html', 'utf8');
        
        // 2. تحديد مكان "حقن" الخبر (بعد كلمة news-grid مباشرة)
        const marker = '<div class="news-grid">';
        if (indexContent.includes(marker)) {
            // إضافة الخبر الجديد في أول القائمة
            indexContent = indexContent.replace(marker, marker + '\n' + newCard);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم حقن الخبر الجديد في الصفحة الرئيسية بنجاح!");
        } else {
            console.log("⚠️ لم يتم العثور على مكان news-grid في الملف.");
        }

    } catch (e) {
        console.error("❌ فشل التحديث:", e.message);
        process.exit(1);
    }
}

generate();
