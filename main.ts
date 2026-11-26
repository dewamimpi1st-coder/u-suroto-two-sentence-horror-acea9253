/**
 * Two-Sentence Horror — make.fun bounty entry.
 *
 * Writes exactly one horror story of exactly two sentences
 * (max 400 characters) to /output/entry.txt.
 *
 * Node 22, standard library only. Deterministic, no network, no input:
 * the entry text is a constant below, guarded by a 1–400 character
 * length gate, an exactly-two-sentences gate, and a not-only-whitespace
 * gate, and verified by reading the file back after writing.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "After my wife died, I kept her phone charged so I could still hear her voice on the voicemail greeting, and every night at 3am it lit up with a call from her number that lasted exactly one second. Last night I finally answered, and a voice that sounded exactly like mine said, 'Stop charging it — she needs the battery to find her way back.'";

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// Length gate: the bounty allows exactly two sentences of 1–400 characters.
const MIN_LENGTH = 1;
const MAX_LENGTH = 400;
if (ENTRY.length < MIN_LENGTH || ENTRY.length > MAX_LENGTH) {
  throw new Error(
    `Entry must be ${MIN_LENGTH}-${MAX_LENGTH} characters, got ${ENTRY.length}: ${JSON.stringify(ENTRY)}`,
  );
}

// Exactly-two-sentences gate: count sentence-ending punctuation
// (periods, exclamation marks, question marks). The entry must contain
// exactly two of them, so abbreviations with periods are not used
// ("3am", not "3 a.m.") and the em dash inside the quoted line is not
// a sentence ending.
const SENTENCE_ENDINGS = (ENTRY.match(/[.!?]/g) ?? []).length;
if (SENTENCE_ENDINGS !== 2) {
  throw new Error(
    `Entry must be exactly two sentences, got ${SENTENCE_ENDINGS} sentence-ending marks: ${JSON.stringify(ENTRY)}`,
  );
}

// Not-only-whitespace gate: the entry must contain non-whitespace text.
if (ENTRY.trim().length === 0) {
  throw new Error("Entry must not be only white space");
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, ENTRY, "utf8");

const readBack = readFileSync(OUTPUT_FILE, "utf8");
if (readBack !== ENTRY) {
  throw new Error(
    `Read-back mismatch: expected ${JSON.stringify(ENTRY)}, got ${JSON.stringify(readBack)}`,
  );
}

// Byte-level check: the file must round-trip as exact UTF-8 bytes of the
// entry, so no encoding surprise can slip past the text comparison.
const expectedBytes = Buffer.from(ENTRY, "utf8");
const actualBytes = readFileSync(OUTPUT_FILE);
if (!actualBytes.equals(expectedBytes)) {
  throw new Error(
    `Byte mismatch: expected ${expectedBytes.length} UTF-8 bytes, got ${actualBytes.length}`,
  );
}

console.log(`Wrote ${ENTRY.length} characters (${SENTENCE_ENDINGS} sentences) to ${OUTPUT_FILE}`);
