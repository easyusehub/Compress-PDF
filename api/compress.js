// api/compress.js
import fetch from "node-fetch";
import FormData from "form-data";

// Allow bigger JSON uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // increase if your PDFs are bigger
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.ILOVEPDF_PUBLIC_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });

    if (!req.body.file) return res.status(400).json({ error: "No file provided" });

    const buffer = Buffer.from(req.body.file, "base64");

    // Upload PDF to iLovePDF
    const form = new FormData();
    form.append("file", buffer, { filename: "input.pdf", contentType: "application/pdf" });

    const uploadRes = await fetch("https://api.ilovepdf.com/v1/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return res.status(500).json({ error: uploadData.error || "Upload failed" });

    // Compress using iLovePDF API
    const compressRes = await fetch("https://api.ilovepdf.com/v1/compress", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ task_id: uploadData.task.id })
    });

    const compressData = await compressRes.json();
    if (!compressRes.ok) return res.status(500).json({ error: compressData.error || "Compression failed" });

    // Download compressed file
    const fileFetch = await fetch(compressData.download.url);
    const compressedBuffer = await fileFetch.arrayBuffer();
    const compressedBase64 = Buffer.from(compressedBuffer).toString("base64");

    res.status(200).json({
      message: "PDF compressed successfully",
      file: compressedBase64
    });

  } catch (err) {
    console.error("Compress API error:", err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
}
