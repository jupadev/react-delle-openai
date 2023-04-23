import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import multer from "multer";
import fs from "fs";

const { VITE_OPENAI_API_KEY } = import.meta.env;
const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: VITE_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage }).single("file");

app.post("/api/images", async (req, res) => {
  const { message = "a cat wearing a samurai suit drawn as japanese art " } =
    req.body;

  const response = await openai.createImage({
    prompt: message,
    n: 4,
    size: "512x512",
  });
  res.send([...response.data.data]);
});

app.post("/api/images/upload", async (req, res) => {
  upload(req, res, (error) => {
    if (error) {
      console.log("API error Upload error", error);
      return res.status(500).send({ message: error.message });
    }

    // Everything went fine.
    const file = req.file;
    res.status(200).send({
      filename: file.filename,
      mimetype: file.mimetype,
      fieldPath: file.path,
      size: file.size,
      fieldname: file.fieldname,
    });
  });

  app.post("/api/images/variations", async (req, res) => {
    const { filePath } = req.body;

    try {
      const file = fs.createReadStream(filePath);
      const response = await openai.createImageVariation(file, 4, "512x512");
      res.send([...response.data.data]);
    } catch (error) {
      console.log("API error generating variations", error);
      res.status(400).send({
        error: error.message,
      });
    }
  });
});

export const handler = app;
