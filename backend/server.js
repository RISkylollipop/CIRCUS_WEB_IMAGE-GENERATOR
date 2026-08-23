const dotenv = require("dotenv");
const express = require("express");
const app = express();
const OpenAI = require("openai");
const cors = require("cors");
const bodyParser = require("body-parser");
const infoLogger = require("./logger/infoLogger");
const errorLogger = require("./logger/errorLogger");
dotenv.config();

const PORT = process.env.PORT;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

// chat Ai incase of future implementation
// const openai = new OpenAI({
//   apiKey: process.env.openaiKey,
//   baseURL: "https://integrate.api.nvidia.com/v1",
// });
// async function main(prompt) {
//   const completion = await openai.chat.completions.create({
//     model: "nvidia/nemotron-3.5-lightning-30b-a3b",
//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//     temperature: 1,
//     top_p: 0.95,
//     max_tokens: 16384,
//     reasoning_budget: 16384,
//     chat_template_kwargs: { enable_thinking: true },
//     stream: true,
//   });

//     let result = "";

//   for await (const chunk of completion) {
//     const content = chunk.choices[0]?.delta?.content || "";
//     result += content;
//   }

//   return result;
// }

const invokeUrl = 
  "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b";
const ImageGenKey = process.env.IMAGEGENKEY;

const headers = {
  Authorization: `Bearer ${ImageGenKey}`,
  Accept: "application/json",
};

app.post("/generateimage", async (req, res) => {
  const { apiProvider, prompt } = req.body;

  infoLogger("Image generation requested", { provider: apiProvider });

  if (!prompt?.trim() || !apiProvider) {
    return res.status(400).json({
      error: "Please select your API provider and input a prompt",
    });
  }

  try {
    if (apiProvider === "nvidia") {
      const payload = {
        prompt: prompt,
        width: 1280,
        height: 720,
        seed: 1,
        steps: 4,
      };
      let response = await fetch(invokeUrl, {
        method: "post",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", ...headers },
      });

      if (response.status != 200) {
        let errBody = await (await response.blob()).text();
        throw (
          "invocation failed with status " + response.status + " " + errBody
        );
      }
      let response_body = await response.json();
      //   console.log(JSON.stringify(response_body));

      const base64Image = response_body.artifacts[0].base64;

      const imageUrl = `data:image/png;base64, ${base64Image}`;

      return res.status(200).json({
        imageUrl,
      });
    }

    return res.status(400).json({
      error: "Unsupported API provider",
    });
  } catch (error) {
    errorLogger(error, { route: "/generateimage", provider: apiProvider });

    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  infoLogger("App listening", { port: PORT });
});
