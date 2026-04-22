const fs = require('fs');

async function generate() {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    const categories = ["أخبار مصر", "تكنولوجيا", "اقتصاد", "رياضة", "فن وثقافة"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // صور واقعية ومختلفة
    const mainImg = `https://picsum.photos/seed/${Math.random()}/1000/600`;
    const subImg1 = `https://picsum.photos/seed/${Math.random()}/400/300`;
    const subImg2 = `https://picsum.photos/seed/${Math.random()}/400/300`;

    const prompt = `اكتب مقالاً إخبارياً طويلاً جداً (تحقيق صحفي) لقسم "${randomCategory}" في "الحدث المصري".
    التعليمات:
    1. العنوان: جذاب جداً، طويل، واحترافي.
    2. التقسيم: المقال يجب أن يتكون من مقدمة، 3 فقرات دسمة، وخاتمة.
    3. الصور: وزع الصور الموفرة لك داخل المقال.
    4. المحتوى: ركز على التفاصيل والتحليل (مقال عالمي).
    
    التنسيق المطلوب كود HTML فقط:
    <div class="news-card" style="grid-column: 1 / -1; max-width: 900px; margin: 0 auto 40px;">
        <div class="card-img">
            <img src="${mainImg}" style="width:100%; height:450px; object-fit:cover;" alt="صورة رئيسية">
        </div>
        <div class="card-content" style="padding: 30px;">
            <span class="tag">${randomCategory}</span>
            <h2 style="font-size:2.5rem; color:#002b5b; margin:20px 0;">عنوان جذاب وشامل</h2>
            
            <p style="font-size:1.2rem; line-height:1.8; color:#333; font-weight:bold;">مقدمة المقال الطويلة والمميزة هنا...</p>
            
            <hr style="margin:25px 0; border:0; border-top:1px solid #eee;">
            
            <div style="display:flex; gap:20px; align-items:center; margin-bottom:25px;">
                <img src="${subImg1}" style="width:200px; height:150px; border-radius:8px; object-fit:cover;">
                <p style="flex:1; line-height:1.7; color:#555;">الفقرة الأولى التفصيلية التي تتحدث عن جوانب الخبر وتحليله العميق...</p>
            </div>

            <p style="line-height:1.7; color:#555; margin-bottom:25px;">الفقرة الثانية التي تضيف معلومات إحصائية أو تاريخية عن الموضوع بشكل موسع...</p>

            <div style="display:flex; gap:20px; align-items:center; margin-bottom:25px; flex-direction: row-reverse;">
                <img src="${subImg2}" style="width:200px; height:150px; border-radius:8px; object-fit:cover;">
                <p style="flex:1; line-height:1.7; color:#555;">الفقرة الثالثة التي تتناول ردود الأفعال أو التأثيرات المستقبلية لهذا الخبر...</p>
            </div>

            <p style="font-style:italic; color:#777; border-top:2px solid var(--gold); padding-top:15px;">خاتمة المقال التي تلخص الموقف بأسلوب "الحدث المصري" الخاص.</p>
        </div>
    </div>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const result = await response.json();
        let fullArticle = result.choices[0].message.content.replace(/```html|```/g, "").trim();

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const marker = '<div class="news-grid">';
        
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, marker + '\n' + fullArticle);
            fs.writeFileSync('index.html', indexContent);
            console.log("✅ تم نشر التحقيق الصحفي بنجاح!");
        }
    } catch (e) {
        process.exit(1);
    }
}
generate();
