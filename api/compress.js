import fetch from "node-fetch";
import FormData from "form-data";

export const config = { api:{ bodyParser:{ sizeLimit:"50mb" } } };

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  try{
    const apiKey = process.env.ILOVEPDF_PUBLIC_KEY;
    if(!apiKey) return res.status(500).json({error:"API key not configured"});

    const { fileName, file } = req.body;
    if(!file) return res.status(400).json({error:"No file provided"});

    const buffer = Buffer.from(file,"base64");

    const form = new FormData();
    form.append("file", buffer, { filename: fileName||"input.pdf", contentType:"application/pdf" });

    // Call iLovePDF compress endpoint
    const upload = await fetch("https://api.ilovepdf.com/v1/compress",{
      method:"POST",
      headers:{Authorization:`Bearer ${apiKey}`},
      body:form
    });

    const result = await upload.json();
    if(!upload.ok) return res.status(500).json({error:JSON.stringify(result)});

    // Download compressed PDF
    const compressedResponse = await fetch(result.output_file.url);
    const compressedBuffer = await compressedResponse.arrayBuffer();
    const compressedBase64 = Buffer.from(compressedBuffer).toString("base64");

    res.status(200).json({ file:compressedBase64 });

  } catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
}
