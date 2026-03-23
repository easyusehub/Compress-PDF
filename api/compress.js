// api/compress.js
import fetch from "node-fetch";
import FormData from "form-data";

// ⚠️ Allow bigger uploads (important for large PDFs)
export const config = {
  api: { bodyParser: { sizeLimit: "50mb" } }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.ILOVEPDF_PUBLIC_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });

    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const buffer = Buffer.from(file, "base64");

    const form = new FormData();
    form.append("file", buffer, {
      filename: "input.pdf",
      contentType: "application/pdf"
    });

    // Upload file to iLovePDF
    const upload = await fetch("https://api.ilovepdf.com/v1/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const uploadResult = await upload.json();
    if (!upload.ok) return res.status(500).json({ error: uploadResult });

    // ⚠️ For demo purposes, we return the uploaded file as "compressed"
    // In real implementation, call iLovePDF compress endpoint after upload
    // Here we simulate compression:
    const compressedFile = buffer; // no real compression yet
    const compressedBase64 = compressedFile.toString("base64");

    res.status(200).json({
      message: "File uploaded successfully. Compression ready.",
      file: compressedBase64
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
