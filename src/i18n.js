// ============================================================
// i18n.js — the game in English, Russian and Uzbek.
//
// Everything the player reads is written in English in the code
// and in data.js, and looked up here at the moment it is drawn:
//   tr("Continue")                       -> "Продолжить"
//   tf("Served {n} / 8", { n: 3 })       -> "Подано 3 / 8"
// The dictionaries (lang-ru.js, lang-uz.js) are keyed by the exact
// English text. Anything missing falls back to English and is
// noted in I18N.missing, so a test run can list what's left.
// ============================================================

const LANGS = [
  { id: "en", name: "English" },
  { id: "ru", name: "Русский" },
  { id: "uz", name: "Oʻzbekcha" }
];

const I18N = {
  lang: "en",
  dict: { ru: {}, uz: {} },
  values: { ru: null, uz: null },       // every translated string, so translating twice is harmless
  missing: {},
  made: new Set(),                     // sentences tf() already built from translated patterns
  set(id) {
    this.lang = LANGS.some(l => l.id === id) ? id : "en";
    try { document.documentElement.lang = this.lang; } catch (e) { /* ignore */ }
  },
  // First visit: follow the browser's language if we speak it.
  detect() {
    try {
      const n = ((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase();
      if (n.startsWith("ru")) return "ru";
      if (n.startsWith("uz")) return "uz";
    } catch (e) { /* ignore */ }
    return "en";
  }
};

function tr(s) {
  const L = I18N.lang;
  if (L === "en" || typeof s !== "string" || s.length < 2 || !/[A-Za-z]/.test(s)) return s;   // key letters like "E" stay
  const t = I18N.dict[L][s];
  if (t !== undefined) return t;
  if (!I18N.values[L]) I18N.values[L] = new Set(Object.values(I18N.dict[L]));
  if (!I18N.values[L].has(s) && !I18N.made.has(s)) I18N.missing[s] = 1;
  return s;
}

// Translate a pattern, then fill its {placeholders}.
function tf(s, vars) {
  let t = tr(s);
  Object.keys(vars || {}).forEach(k => { t = t.split("{" + k + "}").join(String(vars[k])); });
  if (I18N.made.size > 400) I18N.made.clear();
  I18N.made.add(t);
  return t;
}

// Upper-case the first letter (for names dropped at the start of a sentence).
function capFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
