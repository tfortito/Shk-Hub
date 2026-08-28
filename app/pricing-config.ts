// Edit the numbers here to change what you charge. Everything else about the
// tiers (names, feature lists, copy) lives in app/i18n.tsx since it's translated.

export const CURRENCY = "€";

export const PRICING = {
  trial: { price: 0 as number | null },
  pro: { price: 39 as number | null },
  team: { price: null as number | null }, // null => shown as "custom"/"auf Anfrage"
};

// Founding-member discount for the first cohort of paying businesses. Set
// FOUNDER_SLOTS_LEFT to 0 (or FOUNDER_PROGRAM_ACTIVE to false) once it's full —
// the pricing page hides the banner automatically.
export const FOUNDER_PROGRAM_ACTIVE = true;
export const FOUNDER_SLOTS_TOTAL = 10;
export const FOUNDER_SLOTS_LEFT = 10;
export const FOUNDER_PRICE = 29;

export const DEMO_EMAIL = "titogngl66@gmail.com";
