const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function generate() {
  try {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    if (!apiKey) throw new Error("API Key Missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "اكتب مقالاً طويلاً ومنوعاً عن موضوع تريند حالياً في مصر بتنسيق HTML جذاب (h2, p, ul).";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!fs.existsSync('./articles')) fs.mkdirSync('./articles', { recursive: true });
    
    const fileName = `articles/post-${Date.now()}.html`;
    fs.writeFileSync(fileName, response.text());
    console.log("Done: " + fileName);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
generate();
