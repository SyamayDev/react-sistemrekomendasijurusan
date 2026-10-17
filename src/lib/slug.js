export const slugify = (text) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "") // "Al-Qur'an" → "al-quran", not "al-qur-an"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
