const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    // التأكد من وجود مفتاح الـ API
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing!");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // البرومبت اللي بيحدد محتوى المقال
    const prompt = "اكتب مقالاً طويلاً ومنوعاً باللغة العربية عن أكثر موضوع تريند ومشهور حالياً في مصر. استخدم تنسيق HTML جذاب (عناوين h2، فقرات p، وقوائم ul).";

    console.log("جاري توليد المقال عبر Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // التأكد من وجود مجلد articles وإنشاؤه لو مش موجود
    const dir = './articles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("تم إنشاء مجلد articles بنجاح.");
    }

    // تسمية الملف بناءً على التاريخ الحالي لضمان عدم التكرار
    const fileName = `${dir}/post-${Date.now()}.html`;
    
    // حفظ المقال في الملف
    fs.writeFileSync(fileName, text);
    
    console.log(`تم بنجاح! المقال محفوظ في: ${fileName}`);
  } catch (error) {
    console.error("حدث خطأ أثناء التشغيل:", error);
    process.exit(1); // إخبار GitHub Action بأن العملية فشلت
  }
}

generate();
