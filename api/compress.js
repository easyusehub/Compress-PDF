import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = { api:{ bodyParser:false } }; // important for multipart/form-data

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).send("Method not allowed");

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files)=>{
    if(err) return res.status(500).send(err.message);
    if(!files.file) return res.status(400).send("No file uploaded");

    const file = files.file;

    try{
      const apiKey = process.env.ILOVEPDF_PUBLIC_KEY;
      if(!apiKey) return res.status(500).send("API key not configured");

      const formData = new fetch.FormData();
      formData.append("file", fs.createReadStream(file.filepath));

      // Upload to iLovePDF compress endpoint
      const upload = await fetch("https://api.ilovepdf.com/v1/compress",{
        method:"POST",
        headers:{ Authorization:`Bearer ${apiKey}` },
        body: formData
      });

      if(!upload.ok){
        const text = await upload.text();
        return res.status(500).send(text);
      }

      const result = await upload.json();
      // Download compressed PDF
      const compressedResp = await fetch(result.output_file.url);
      const compressedBuffer = await compressedResp.arrayBuffer();

      res.setHeader("Content-Type","application/pdf");
      res.send(Buffer.from(compressedBuffer));

    } catch(e){
      console.error(e);
      res.status(500).send(e.message);
    }
  });
}
