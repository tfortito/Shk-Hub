// Reads every PDF in corpus/raw/, splits into paragraph chunks, writes corpus/chunks.json.
// Validity dates are NEVER guessed. Anything undetermined goes to needs-review.txt
// for you to fill in by hand. That metadata is the product, so it is worth the manual pass.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const RAW = path.join(process.cwd(), "corpus", "raw");
const OUT = path.join(process.cwd(), "corpus", "chunks.json");
const REVIEW = path.join(process.cwd(), "corpus", "needs-review.txt");

const MIN_WORDS = 40;
const MAX_WORDS = 600;

// Matches German legal references so each chunk carries a real locator.
const REF = /(§+\s*\d+[a-z]?(\s*Abs\.\s*\d+)?(\s*Satz\s*\d+)?|Ziffer\s*\d+(\.\d+)*|Nummer\s*\d+(\.\d+)*|Anlage\s*\d+)/;

function words(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// Split on blank lines, then merge runts forward and hard-split anything oversized
// at sentence boundaries. Never mid-sentence.
function chunkText(raw) {
  const paras = raw
    .replace(/\r/g, "")
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

  const merged = [];
  let buf = "";
  for (const p of paras) {
    const candidate = buf ? `${buf} ${p}` : p;
    if (words(candidate) < MIN_WORDS) {
      buf = candidate;
      continue;
    }
    merged.push(candidate);
    buf = "";
  }
  if (buf) merged.push(buf);

  const out = [];
  for (const m of merged) {
    if (words(m) <= MAX_WORDS) {
      out.push(m);
      continue;
    }
    const sentences = m.match(/[^.!?]+[.!?]+(\s|$)/g) || [m];
    let acc = "";
    for (const s of sentences) {
      if (acc && words(acc + s) > MAX_WORDS) {
        out.push(acc.trim());
        acc = "";
      }
      acc += s;
    }
    if (acc.trim()) out.push(acc.trim());
  }
  return out;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

async function main() {
  if (!fs.existsSync(RAW)) {
    console.error(`No corpus/raw directory. Create it and add verified source PDFs.`);
    process.exit(1);
  }
  const files = fs.readdirSync(RAW).filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) {
    console.error("corpus/raw is empty. Add PDFs you have verified at the official source.");
    process.exit(1);
  }

  const chunks = [];
  const review = [];

  for (const file of files) {
    const buf = fs.readFileSync(path.join(RAW, file));
    const parsed = await pdfParse(buf);
    const title = path.basename(file, ".pdf");
    const pieces = chunkText(parsed.text);

    pieces.forEach((text, i) => {
      const refMatch = text.match(REF);
      const id = `${slug(title)}-${String(i).padStart(4, "0")}`;

      chunks.push({
        id,
        documentTitle: title,
        documentShortName: title.split(/[-_]/)[0],
        paragraphRef: refMatch ? refMatch[0].replace(/\s+/g, " ").trim() : null,
        text,
        validFrom: null,
        validUntil: null,
        sourceUrl: null,
        supersededBy: null,
      });

      // Every chunk needs validity and a source URL before it is demo-safe.
      review.push(`${id}\tvalidFrom+sourceUrl missing\t${text.slice(0, 90).replace(/\s+/g, " ")}...`);
    });

    console.log(`${file}: ${pieces.length} chunks`);
  }

  fs.writeFileSync(OUT, JSON.stringify(chunks, null, 2));
  fs.writeFileSync(REVIEW, review.join("\n"));

  console.log(`\nWrote ${chunks.length} chunks to corpus/chunks.json`);
  console.log(`${review.length} entries need manual validity dating: corpus/needs-review.txt`);
  console.log(`\nDo not demo until validFrom and sourceUrl are filled in. An uncited or`);
  console.log(`undated answer is worse than no answer for this product.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
