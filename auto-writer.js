const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    // تنظيف المفتاح من أي حروف غريبة (حل مشكلة ByteString)
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    if (!apiKey) throw new Error("API Key Missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "اكتب مقالاً طويلاً ومنوعاً عن موضوع تريند حالياً في مصر بتنسيق HTML جذاب (h2, p, ul).";

    console.log("جاري طلب المقال...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });

    const fileName = `articles/post-${Date.now()}.html`;
    fs.writeFileSync(fileName, text);
    console.log("تم الحفظ بنجاح: " + fileName);
  } catch (error) {
    console.error("حدث خطأ:", error.message);
    process.exit(1);
  }
}
generate();
