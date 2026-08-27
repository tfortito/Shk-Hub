// Edit the numbers here to change what you charge. Everything else about the
// tiers (names, feature lists, copy) lives in app/i18n.tsx since it's translated.

export const CURRENCY = "€";

export const PRICING = {
  trial: { price: 0 as number | null },
  pro: { price: 39 as number | null },
  team: { price: null as number | null }, // null => shown as "custom"/"auf Anfrage"
};

export const DEMO_EMAIL = "titogngl66@gmail.com";
