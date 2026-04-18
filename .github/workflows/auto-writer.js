const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "اكتب مقالاً طويلاً ومنوعاً باللغة العربية عن أكثر موضوع تريند ومشهور حالياً في مصر. استخدم تنسيق HTML (فقرات p، عناوين h2).";
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    if (!fs.existsSync('articles')) fs.mkdirSync('articles');
    const fileName = `articles/post-${Date.now()}.html`;
    fs.writeFileSync(fileName, response.text());
    console.log("Success!");
  } catch (e) { console.error(e); }
}
generate();
