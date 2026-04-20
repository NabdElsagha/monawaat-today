const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    // السطر ده بيمسح أي مسافات أو حروف مخفية في المفتاح تلقائياً
    const key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    
    if (!key) throw new Error("Key is empty");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "اكتب مقالاً طويلاً ومنوعاً باللغة العربية عن موضوع تريند ومشهور حالياً في مصر بتنسيق HTML جذاب.";

    console.log("جاري التوليد...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });

    const fileName = `articles/post-${Date.now()}.html`;
    fs.writeFileSync(fileName, response.text());
    
    console.log("تم بنجاح: " + fileName);
  } catch (e) {
    console.error("خطأ: ", e.message);
    process.exit(1);
  }
}

generate();
