import juice from "juice";
import path from "path";
import { promises as fs } from "fs";

run(...process.argv.slice(2)).catch((err) => {
  process.exitCode = 1;
  console.error(err);
});

async function run(sourceFile?: string, destDir?: string): Promise<void> {
  if (!sourceFile || !destDir) {
    throw new Error("Usage: build.ts sourceFile destDir");
  }
  await build(sourceFile, destDir);
}

export async function build(
  file: string,
  outDir: string
): Promise<{ normal: string; inlined: string }> {
  const juiceOptions: juice.Options = {
    webResources: {
      images: 0,
    },
  };

  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch (err) {}

  const normal = path.join(outDir, path.basename(file));
  await fs.writeFile(
    normal,
    await juiceFile(file, {
      ...juiceOptions,
      applyStyleTags: false,
      removeStyleTags: false,
    })
  );

  const inlined = path.join(
    outDir,
    path.basename(file).replace(/(\..+)$/, "-inlined$1")
  );
  await fs.writeFile(inlined, await juiceFile(file, juiceOptions));

  return { normal, inlined };
}

function juiceFile(file: string, options: juice.Options): Promise<string> {
  return new Promise((resolve, reject) => {
    juice.juiceFile(file, options, (err, html) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(html);
    });
  });
}
