const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    // السطر ده هو اللي بينظف المفتاح من أي حروف غريبة
    const key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/[\u200B-\u200D\uFEFF]/g, "") : "";
    if (!key) throw new Error("Key is missing");

    const genAI = new GoogleGenerativeAI(key);
    // السطر ده بينادي الموديل بالطريقة الجديدة الصحيحة
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "اكتب مقالاً طويلاً ومنوعاً باللغة العربية عن موضوع تريند في مصر بتنسيق HTML جذاب.";
    const result = await model.generateContent(prompt);
    
    if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
    fs.writeFileSync(`articles/post-${Date.now()}.html`, result.response.text());
    console.log("Done!");
  } catch (e) { console.error(e); process.exit(1); }
}
generate();
