/**
 * Khmer word segmentation (FR-05).
 *
 * Khmer is written without spaces between words, so keyword retrieval has
 * nothing to tokenise on. Production will use a trained segmenter (or ICU
 * dictionary-based break iteration). This implementation is a deterministic
 * orthographic-cluster segmenter with a maintained lexicon of the terms that
 * matter for government service vocabulary.
 *
 * The contract that matters more than the algorithm: the SAME function runs at
 * index time and at query time. Swapping the implementation is safe as long as
 * both sides swap together.
 */

import { normalizeFold } from "./normalize";
import { normaliseWord } from "@/lib/lang/stem";

const COENG = "្";
const KHMER = /[ក-៿]/;

// Code-point range checks, equivalent to the character classes
// [ក-឵] (consonants and independent vowels), [ា-ៅ] (vowel signs) and
// [ំ-៑៝] (diacritics). Called once per character of the corpus at index
// time, where a regex test per character was a measurable share of cold start.
function isConsonant(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return c >= 0x1780 && c <= 0x17b5;
}
function isVowelOrDiacritic(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return (c >= 0x17b6 && c <= 0x17c5) || (c >= 0x17c6 && c <= 0x17d1) || c === 0x17dd;
}

/**
 * Service-domain lexicon. Longest-match-first segmentation uses this before
 * falling back to cluster n-grams. Extend as ministries onboard — this is
 * ordinary content maintenance, not a code change.
 */
const LEXICON = [
  "ប័ណ្ណបើកបរ", // driving licence
  "សំបុត្រកំណើត", // birth certificate
  "អត្តសញ្ញាណប័ណ្ណ", // identity card
  "សៀវភៅគ្រួសារ", // family book
  "ការចុះបញ្ជី", // registration
  "ចុះបញ្ជី", // register
  "រដ្ឋបាលឃុំ", // commune administration
  "ឃុំសង្កាត់", // commune / sangkat
  "ក្រសួងមហាផ្ទៃ", // Ministry of Interior
  "សាធារណការ", // public works
  "ដឹកជញ្ជូន", // transport
  "បន្តអាយុកាល", // renew validity
  "អាយុកាល", // validity period
  "ឯកសារ", // document
  "តម្រូវការ", // requirement
  "កំណត់ពេល", // deadline
  "បង់ប្រាក់", // payment
  "បង្កាន់ដៃ", // receipt
  "ថ្លៃសេវា", // service fee
  "ការិយាល័យ", // office
  "ខេត្ត", // province
  "ប័ណ្ណ", // licence / card
  "កំណើត", // birth
  "សំបុត្រ", // certificate
  "បើកបរ", // drive
  "ត្រូវការ", // need
  "យឺតយ៉ាវ", // late
  "ហួសកំណត់", // overdue
  "សាក្សី", // witness
  "ប្តូរឈ្មោះ", // name change
  "លិខិត", // letter / document
  "រូបថត", // photograph
  "ថ្លៃ", // price
  "ប្រាក់", // money
  "យឺត", // late
  "ណា", // which
  "អ្វី", // what
  "ដូចម្តេច", // how
].sort((a, b) => b.length - a.length);

const LEXICON_FOLDED = LEXICON.map(normalizeFold);

/** Lexicon entries by first character, longest first, so a lookup scans only
 *  the entries that could match at a position. */
const LEXICON_BY_FIRST = new Map<string, string[]>();
for (const w of LEXICON_FOLDED) {
  const first = w[0];
  const list = LEXICON_BY_FIRST.get(first) ?? [];
  list.push(w);
  LEXICON_BY_FIRST.set(first, list);
}

/**
 * Split Khmer text into orthographic clusters. A cluster is a base consonant
 * plus its subscripts, vowel signs, and diacritics — the smallest unit that is
 * safe to break on without corrupting rendering.
 */
export function clusters(input: string): string[] {
  const chars = Array.from(input);
  const out: string[] = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    if (!isConsonant(ch)) {
      out.push(ch);
      i += 1;
      continue;
    }

    let cluster = ch;
    i += 1;

    while (i < chars.length) {
      const c = chars[i];
      if (c === COENG && i + 1 < chars.length && isConsonant(chars[i + 1])) {
        cluster += c + chars[i + 1];
        i += 2;
        continue;
      }
      if (isVowelOrDiacritic(c)) {
        cluster += c;
        i += 1;
        continue;
      }
      break;
    }

    out.push(cluster);
  }

  return out;
}

/** Longest-match-first pass over a run of Khmer text using the lexicon. */
function segmentKhmerRun(run: string, runClusters: string[]): string[] {
  const tokens: string[] = [];

  // Cluster boundaries of the run, computed once. Clustering is greedy left to
  // right, so the cluster starting at a boundary is the same whether the run
  // is clustered from its start or from that boundary. Re-clustering the whole
  // remainder after every token (the previous approach) was quadratic in the
  // run length and dominated cold-start indexing once crawled pages joined the
  // corpus. Only a lexicon hit that ends mid-cluster forces a re-cluster.
  let clusterAt = new Map<number, string>();
  const indexClusters = (from: number, cs: string[]) => {
    clusterAt = new Map();
    let offset = from;
    for (const c of cs) {
      clusterAt.set(offset, c);
      offset += c.length;
    }
  };
  indexClusters(0, runClusters);

  let pos = 0;
  while (pos < run.length) {
    const hit = LEXICON_BY_FIRST.get(run[pos])?.find((w) => run.startsWith(w, pos));
    if (hit) {
      tokens.push(hit);
      pos += hit.length;
      continue;
    }

    // No lexicon match at this position. Emit one cluster and advance; the
    // caller also emits cluster bigrams so that unlexicalised compounds still
    // match partially rather than not at all.
    if (!clusterAt.has(pos)) indexClusters(pos, clusters(run.slice(pos)));
    const c = clusterAt.get(pos);
    if (!c) break;
    tokens.push(c);
    pos += c.length;
  }

  return tokens;
}

/**
 * Tokenise mixed Khmer / Latin text into comparable units.
 * Latin words are lowercased, split on non-alphanumerics, and suffix-stripped
 * (see lib/lang/stem.ts — without it "registering" never matches "register");
 * Khmer runs go through the segmenter and do not inflect this way, so they are
 * left alone. Khmer cluster bigrams are appended as extra units to lift recall
 * on compounds the lexicon does not yet cover (R-07).
 */
export function segment(input: string): string[] {
  const s = normalizeFold(input);
  const tokens: string[] = [];

  // Split into alternating Khmer / non-Khmer runs.
  const runs = s.split(/([ក-៿]+)/).filter(Boolean);

  for (const run of runs) {
    if (KHMER.test(run)) {
      const cs = clusters(run);
      const words = segmentKhmerRun(run, cs);
      tokens.push(...words);

      for (let i = 0; i + 1 < cs.length; i += 1) {
        tokens.push(cs[i] + cs[i + 1]);
      }
    } else {
      run
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 1)
        .forEach((w) => tokens.push(normaliseWord(w.toLowerCase())));
    }
  }

  return tokens;
}
