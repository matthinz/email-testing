import juice from "juice";
import path from "path";
import { promises as fs } from "fs";

run(...process.argv.slice(2)).catch((err) => {
  process.exitCode = 1;
  console.error(err);
});

function run(sourceFile?: string, destFile?: string): Promise<void> {
  if (!sourceFile || !destFile) {
    throw new Error("Usage: build.ts sourceFile destFile");
  }

  const juiceOptions: juice.Options = {
    webResources: {
      images: 0,
    },
  };

  return new Promise((resolve, reject) => {
    juice.juiceFile(sourceFile, juiceOptions, (err, html) => {
      if (err) {
        reject(err);
        return;
      }

      fs.writeFile(destFile, html).then(resolve, reject);
    });
  });
}
