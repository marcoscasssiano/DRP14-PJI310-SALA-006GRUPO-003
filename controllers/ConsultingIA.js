const OpenAI = require("openai");
const dotenv = require('dotenv')

dotenv.config();

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DPKEY
});

async function main(req, res) {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "O campo 'messages' é obrigatório e deve ser um array." });
        }

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "deepseek-chat",
        });

        res.status(200).json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error("Erro ao consultar a IA:", error);
        res.status(500).json({ error: "Erro ao processar a solicitação com a IA." });
    }
}

module.exports = { main };