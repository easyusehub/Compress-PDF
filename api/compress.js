import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.ILOVEPDF_PUBLIC_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key not configured"
      });
    }

    const buffer = Buffer.from(req.body.file, "base64");

    const form = new FormData();
    form.append("file", buffer, {
      filename: "input.pdf",
      contentType: "application/pdf"
    });

    const upload = await fetch("https://api.ilovepdf.com/v1/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    const uploadResult = await upload.json();

    if (!upload.ok) {
      return res.status(500).json(uploadResult);
    }

    // ⚠️ Demo response (real compression steps add করা যাবে)
    res.status(200).json({
      message: "File uploaded successfully. Compression ready.",
      data: uploadResult
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
