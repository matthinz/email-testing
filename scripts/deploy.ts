import * as dotenv from "dotenv";
import AWS from "aws-sdk";
import { promises as fs } from "fs";
import path from "path";

dotenv.config();

run(process.argv.slice(2)).catch((err) => {
  process.exitCode = 1;
  console.error(err);
});

async function run(params: string[]) {
  const bucket = process.env.S3_BUCKET;
  const dir = new Date().toISOString().replace(/(:|-|\.\d+Z$)/g, "");

  if (!bucket) {
    throw new Error("S3_BUCKET not set");
  }

  const { url } = await uploadEmailTemplate(params[0], bucket, dir);
  console.log(url);
}

export async function uploadEmailTemplate(
  templateFile: string,
  bucket: string,
  dir: string
): Promise<{
  url: string;
  html: string;
}> {
  const contents = (await fs.readFile(templateFile)).toString("utf-8");

  const baseUrl = [
    "https://",
    bucket,
    ".s3.",
    process.env.AWS_REGION ?? "us-east-1",
    ".amazonaws.com",
  ].join("");

  const imagesToUpload: { [key: string]: string } = {};

  // adapt contents
  const tweakedContents = contents.replace(
    /"(\.\.\/(images\/[^"]+))"/g,
    (_, relativeImagePath, pathFromImagesDir) => {
      const localImagePath = path.resolve(
        path.dirname(templateFile),
        relativeImagePath
      );
      imagesToUpload[localImagePath] = pathFromImagesDir;
      return `"${baseUrl}/${dir}/${pathFromImagesDir}"`;
    }
  );

  const filename = path.basename(templateFile);

  const key = [dir, "emails", filename].join("/");

  await putFile(bucket, key, tweakedContents, "text/html");

  await Promise.all(
    Object.keys(imagesToUpload).map(async (localImagePath) => {
      const imageKey = [dir, imagesToUpload[localImagePath]].join("/");
      const contentType = "image/png";
      const data = await fs.readFile(localImagePath);
      await putFile(bucket, imageKey, data, contentType);
    })
  );

  return {
    url: [baseUrl, key].join("/"),
    html: tweakedContents,
  };
}

async function putFile(
  bucket: string,
  key: string,
  data: string | Buffer,
  contentType: string
): Promise<void> {
  const s3 = new AWS.S3();

  return new Promise((resolve, reject) => {
    const request: AWS.S3.PutObjectRequest = {
      Body: data,
      Bucket: bucket,
      ContentType: contentType,
      Key: key,
    };

    s3.putObject(request, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
