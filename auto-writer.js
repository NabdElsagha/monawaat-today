const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "اكتب مقالاً طويلاً ومنوعاً عن تريند مشهور اليوم في مصر بتنسيق HTML.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    if (!fs.existsSync('articles')) fs.mkdirSync('articles');
    fs.writeFileSync(`articles/post-${Date.now()}.html`, response.text());
    console.log("Done!");
  } catch (e) { console.error(e); }
}
generate();
