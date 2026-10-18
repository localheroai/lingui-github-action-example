// Checks ICU plurals in the target catalogs. `lingui compile --strict` accepts
// both of these mistakes and renders wrong text for some counts:
// - a missing CLDR category, e.g. `few` in Polish, falls back to `other`
// - a branch that drops `#` shows "osoby" where it should show "3 osoby"
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@messageformat/parser";
import { po } from "gettext-parser";

const CATALOG_DIR = "src/locales";
const CATALOG_FILE = "messages.po";
const SOURCE_LOCALE = "en";
const PLURAL_TYPES = { plural: "cardinal", selectordinal: "ordinal" };
const SAMPLE_NUMBERS = Array.from({ length: 1001 }, (_, n) => n);

function readCatalog(locale) {
  const catalog = po.parse(readFileSync(join(CATALOG_DIR, locale, CATALOG_FILE)));
  return Object.values(catalog.translations)
    .flatMap((entries) => Object.values(entries))
    .filter(({ msgid, msgstr }) => msgid && msgstr[0])
    .map(({ msgid, msgstr }) => ({ msgid, message: msgstr[0] }));
}

function pluralBlocks(tokens) {
  return tokens.flatMap((token) => {
    if (!token.cases) return [];
    const nested = token.cases.flatMap((branch) => pluralBlocks(branch.tokens));
    return token.type in PLURAL_TYPES ? [token, ...nested] : nested;
  });
}

function showsCount(tokens, arg) {
  return tokens.some((token) => token.type === "octothorpe" || (token.type === "argument" && token.arg === arg));
}

// Arabic `two` only ever means 2, so "عضوان" needs no digit. Polish `few`
// covers 2, 3, 4, 22... and has to show which one.
function coversOneNumber(locale, type, category) {
  const rules = new Intl.PluralRules(locale, { type });
  return SAMPLE_NUMBERS.filter((n) => rules.select(n) === category).length === 1;
}

function problemsIn(message, sourceMessage, locale) {
  const categories = (type) => new Intl.PluralRules(locale, { type }).resolvedOptions().pluralCategories;
  let blocks;
  try {
    blocks = pluralBlocks(parse(message, { cardinal: categories("cardinal"), ordinal: categories("ordinal") }));
  } catch (error) {
    return [error.message];
  }
  const sourceBlocks = pluralBlocks(parse(sourceMessage));

  return blocks.flatMap((block) => {
    const type = PLURAL_TYPES[block.type];
    const present = new Set(block.cases.map((branch) => branch.key));
    const missing = categories(type).filter((category) => !present.has(category));
    const problems = missing.length ? [`{${block.arg}, ${block.type}} lacks ${missing.join(", ")}`] : [];

    const sourceOther = sourceBlocks.find((source) => source.arg === block.arg)?.cases.find((c) => c.key === "other");
    if (!sourceOther || !showsCount(sourceOther.tokens, block.arg)) return problems;
    for (const branch of block.cases) {
      if (branch.key.startsWith("=") || coversOneNumber(locale, type, branch.key)) continue;
      if (!showsCount(branch.tokens, block.arg)) problems.push(`{${block.arg}, ${block.type}} ${branch.key} drops the count (#)`);
    }
    return problems;
  });
}

const sourceMessages = new Map(readCatalog(SOURCE_LOCALE).map(({ msgid, message }) => [msgid, message]));
const targetLocales = readdirSync(CATALOG_DIR).filter((locale) => locale !== SOURCE_LOCALE);

const failures = targetLocales.flatMap((locale) =>
  readCatalog(locale).flatMap(({ msgid, message }) =>
    problemsIn(message, sourceMessages.get(msgid) ?? msgid, locale).map((problem) => `${locale}: "${msgid}"\n    ${problem}`)
  )
);

if (failures.length) {
  console.error(`Plural problems:\n\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`ICU plurals have every CLDR category and keep the count for: ${targetLocales.join(", ")}`);
