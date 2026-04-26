const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار عالمية", "اقتصاد", "حوادث", "تكنولوجيا", "رياضة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `اكتب تقريراً صحفياً تحليلياً ضخماً وواقعياً لقسم "${randomCategory}" لموقع "الحدث المصري".
    التعليمات المهنية:
    1. الهدف: محتوى تريند عالمي، دسم، وواقعي مكون من 60 جملة كاملة.
    2. الهيكل: 
       - أول 5 جمل (مقدمة مثيرة) توضع داخل وسم <p>.
       - باقي الـ 55 جملة توضع داخل وسم <div class="more-text">.
    3. الأمان: ممنوع ذكر السياسة المصرية الداخلية نهائياً.
    4. الصورة: اختر كلمة إنجليزية دقيقة (مثل: AI, Crypto, Stadium).

    الرد كود HTML فقط:
    <div class="news-card">
        <div class="card-img">
            <span class="badge">${randomCategory} - تريند</span>
            <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80&sig=${Math.floor(Math.random() * 99999)}" alt="تريند">
        </div>
        <div class="card-body">
            <h3>عنوان التريند العالمي هنا</h3>
            <p>أول 5 جمل من المقال هنا...</p>
            <div class="more-text">باقي الـ 55 جملة من التحليل العميق والتريند هنا...</div>
            <button class="btn-more" onclick="toggleReadMore(this)">إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${apiKey}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // عشوائية الصورة
        const uniqueID = Date.now();
        content = content.replace(/sig=\d+/, `sig=${uniqueID}`);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            // إضافة الخبر الجديد تحت الماركر مباشرة
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر المقال بنجاح وتحديث الموقع.");
        }
    } catch (e) {
        console.error("حدث خطأ:", e.message);
        process.exit(1);
    }
}
generate();
