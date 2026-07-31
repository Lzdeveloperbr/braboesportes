import crest from "@/assets/brabo-crest.png.asset.json";
import hero from "@/assets/brabo-hero.png.asset.json";
import lockup from "@/assets/brabo-lockup.png.asset.json";

export const BRAND = {
  crest: crest.url,
  lockup: lockup.url,
  hero: hero.url,
  name: "Brabo Esporte Clube",
};

export const CATEGORIAS = [
  "Sub-9",
  "Sub-11",
  "Sub-13",
  "Sub-15",
  "Sub-17",
  "Sub-20",
  "Adulto",
] as const;
