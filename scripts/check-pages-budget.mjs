import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const limit = 850000000;
const staged = process.argv.includes("--staged");
let bytes, files;
if (staged) {
  const entries = execFileSync("git", ["ls-files", "--stage", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const hashes = entries.map(entry => {
    const match = /^\d+ ([a-f0-9]+) 0\t/.exec(entry);
    if (!match) throw new Error("Resolve all index conflicts before checking the publication budget.");
    return match[1];
  });
  const sizes = execFileSync("git", ["cat-file", "--batch-check=%(objecttype) %(objectsize)"], {
    input: hashes.join("\n") + "\n", encoding: "utf8",
  }).trim().split("\n").map(line => {
    if (!/^blob \d+$/.test(line)) throw new Error(`Unexpected publication object: ${line}`);
    return Number(line.slice(5));
  });
  files = sizes.length;
  bytes = sizes.reduce((sum, size) => sum + size, 0);
} else {
  const paths = new Set(execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" }).split("\0").filter(Boolean));
  const sizes = [...paths].filter(path => existsSync(path)).map(path => statSync(path).size);
  files = sizes.length;
  bytes = sizes.reduce((sum, size) => sum + size, 0);
}
if (bytes > limit) throw new Error(`Published content exceeds the ${limit}-byte budget: ${bytes} bytes.`);
console.log(JSON.stringify({ scope: staged ? "staged publication tree" : "conservative worktree candidate",
  files, bytes, budget: limit, headroom: limit - bytes }));
