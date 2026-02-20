import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Context } from "hono";

export const storageUpload = async (c:Context<{Bindings: CloudflareBindings;}>)=>{
    console.log('initiate upload')
    const s3 = new S3Client({
        region: "auto",
        endpoint: c.env.STORAGE_ENDPOINT,
        credentials: {
            accessKeyId: c.env.S3_ACCESS_KEY_ID,
            secretAccessKey: c.env.S3_SECRET_ACCESS_KEY,
        },
    });
    const formData = await c.req.formData()
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    console.log(file.name)
    console.log(file.type)
    console.log(path)

    const putObjectCommand = new PutObjectCommand({
        Bucket:'akademiremi',
        ContentType:file.type,
        Key:path,
        Body:buffer
    })

    const response = await s3.send(putObjectCommand);
    return new Response(JSON.stringify({success:true, filename: file.name, response}),{status:200})
  
}