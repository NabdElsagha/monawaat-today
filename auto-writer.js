const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    if (!apiKey) throw new Error("API Key Missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    // استخدمنا gemini-pro كبديل أضمن لو فلاش لسه فيه مشكلة في منطقتك
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "اكتب مقالاً إخبارياً طويلاً عن أهم تريند في مصر اليوم بتنسيق HTML جذاب.";
    
    console.log("جاري طلب المقال من Gemini...");
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
