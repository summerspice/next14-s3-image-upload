//export const dynamic = 'force-dynamic' // defaults to auto
import { Upload } from "@aws-sdk/lib-storage";
import { NextResponse } from "next/server";
import {
  S3Client,
  S3ClientConfig,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

interface AWSS3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

interface AWSS3Config extends S3ClientConfig {
  credentials: AWSS3Credentials;
}

const {
  NEXT_PUBLIC_AWS_S3_REGION,
  NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
  NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY,
  NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
} = process.env;

// Check if process.env variables are present
if (
  !NEXT_PUBLIC_AWS_S3_REGION ||
  !NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID ||
  !NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY ||
  !NEXT_PUBLIC_AWS_S3_BUCKET_NAME
) {
  throw new Error("AWS S3 environment variables are not properly defined.");
}

const s3Config: AWSS3Config = {
  region: NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY,
  },
};

async function uploadFileToS3(
  fileBuffer: ArrayBuffer,
  fileName: string | undefined,
) {
  console.log(fileName);

  const s3Client = new S3Client(s3Config);

  const params = {
    Bucket: NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
    Key: `${fileName}-${Date.now()}`,
    Body: new Uint8Array(fileBuffer), // Convert ArrayBuffer to Uint8Array
    ContentType: "image/jpg",
  };

  const upload = new Upload({
    client: s3Client,
    params: params,
    // Other configuration options if needed
  });

  try {
    const data = await upload.done();
    console.log("File uploaded successfully:", data);
    return data.Key; // Return the key of the uploaded file
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = await uploadFileToS3(buffer, file.name);

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    return NextResponse.json({ error: "Error uploading file" });
  }
}
