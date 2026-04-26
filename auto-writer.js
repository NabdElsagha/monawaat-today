const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["Trending", "World", "Business", "Tech", "Lifestyle", "Sport"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    // البرومبت ده بيجبر الـ AI يختار "اسم بطل الخبر" أو "الحدث الرئيسي" عشان نستخدمه في الصورة
    const prompt = `اكتب مقالاً إخبارياً لبراند "ENB" في قسم "${randomCat}".
    شروط صارمة:
    1. ابحث عن تريند حقيقي وشخصية مشهورة (مثلاً: محمد صلاح، كريستيانو، ميسي، إيلون ماسك، أو حدث مثل إطلاق آيفون جديد).
    2. استخرج "كلمة مفتاحية واحدة بالإنجليزية" تعبر عن الشخصية أو الحدث بدقة (مثال: Mo Salah).
    3. المقال يجب أن يكون 40 جملة متنوعة بدون أي تكرار نهائياً.

    الرد كود HTML فقط:
    <div class="article-card" data-category="${randomCat}">
        <div class="card-img-wrap">
            <span class="badge ${randomCat === 'Trending' ? 'badge-trend' : 'badge-normal'}">${randomCat}</span>
            <img src="https://loremflickr.com/800/600/[KEYWORD]" class="card-img" alt="News Image">
        </div>
        <div class="card-body">
            <h3>عنوان الخبر باللغة العربية</h3>
            <p>مقدمة المقال (5 جمل)...</p>
            <div class="full-article">تفاصيل دسمة جداً (35 جملة)...</div>
            <button class="read-btn" onclick="toggleRead(this)">Read More / إقرأ المزيد</button>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8
            })
        });

        const result = await response.json();
        let content = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        // استخراج العنوان لمحاولة استنتاج الكلمة المفتاحية لو الـ AI منساش
        // أو هنخلي الـ AI نفسه يكتب الكلمة جوه الرابط، أنا ظبطت البرومبت يعمل ده.
        // لو الـ AI كتب [KEYWORD]، هنستبدلها بأول كلمة في العنوان بالإنجليزي أو اسم القسم
        if (content.includes('[KEYWORD]')) {
             content = content.replace('[KEYWORD]', randomCat.toLowerCase());
        }

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div id="newsGrid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + content);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ Smart Article Published!");
        }
    } catch (e) {
        console.error("Error: " + e.message);
    }
}
generate();
