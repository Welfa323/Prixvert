import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  {
    slug: "telephones-tablettes",
    name: "Téléphones & Tablettes",
    shortName: "Téléphones",
    description: "Smartphones, tablettes et accessoires des plus grandes marques, garantis et livrés rapidement.",
    tone: "bg-sky-50 text-sky-700",
    subcategories: [
      { slug: "smartphones", name: "Smartphones" },
      { slug: "tablettes", name: "Tablettes" },
      { slug: "accessoires-telephone", name: "Accessoires téléphone" },
    ],
  },
  {
    slug: "electronique",
    name: "Électronique & Informatique",
    shortName: "Électronique",
    description: "Ordinateurs portables, audio, objets connectés : la tech au meilleur prix.",
    tone: "bg-indigo-50 text-indigo-700",
    subcategories: [
      { slug: "ordinateurs-portables", name: "Ordinateurs portables" },
      { slug: "audio", name: "Audio & Son" },
      { slug: "objets-connectes", name: "Objets connectés" },
    ],
  },
  {
    slug: "mode-femme",
    name: "Mode Femme",
    shortName: "Mode Femme",
    description: "Robes, sacs, chaussures, bijoux et montres pour toutes les occasions.",
    tone: "bg-pink-50 text-pink-700",
    subcategories: [
      { slug: "robes", name: "Robes & Ensembles" },
      { slug: "hauts-robes-ete", name: "Robes d'été" },
      { slug: "chaussures-femme", name: "Chaussures femme" },
      { slug: "sacs", name: "Sacs" },
      { slug: "bijoux", name: "Bijoux" },
      { slug: "montres-femme", name: "Montres femme" },
    ],
  },
  {
    slug: "mode-homme",
    name: "Mode Homme",
    shortName: "Mode Homme",
    description: "Chemises, sneakers, montres et accessoires pour un style affirmé.",
    tone: "bg-slate-100 text-slate-700",
    subcategories: [
      { slug: "chemises-tshirts", name: "Chemises & T-shirts" },
      { slug: "chaussures-homme", name: "Chaussures homme" },
      { slug: "montres-homme", name: "Montres homme" },
      { slug: "accessoires-homme", name: "Lunettes & accessoires" },
    ],
  },
  {
    slug: "beaute-sante",
    name: "Beauté & Santé",
    shortName: "Beauté",
    description: "Maquillage, parfums authentiques et soins du corps.",
    tone: "bg-rose-50 text-rose-700",
    subcategories: [
      { slug: "maquillage", name: "Maquillage" },
      { slug: "parfums", name: "Parfums" },
      { slug: "soins-corps", name: "Soins du corps" },
    ],
  },
  {
    slug: "maison-cuisine",
    name: "Maison & Cuisine",
    shortName: "Maison",
    description: "Électroménager, ustensiles, meubles et décoration pour un intérieur qui vous ressemble.",
    tone: "bg-amber-50 text-amber-700",
    subcategories: [
      { slug: "electromenager", name: "Électroménager" },
      { slug: "cuisine", name: "Cuisine & ustensiles" },
      { slug: "meubles", name: "Meubles" },
      { slug: "decoration", name: "Décoration" },
    ],
  },
  {
    slug: "supermarche",
    name: "Supermarché",
    shortName: "Supermarché",
    description: "Vos courses du quotidien livrées en moins de 3 h à Abidjan.",
    tone: "bg-lime-50 text-lime-700",
    subcategories: [
      { slug: "epicerie", name: "Épicerie" },
      { slug: "produits-frais", name: "Produits frais" },
      { slug: "fruits-legumes", name: "Fruits & légumes" },
      { slug: "boissons", name: "Boissons" },
      { slug: "animalerie", name: "Animalerie" },
    ],
  },
  {
    slug: "sport-loisirs",
    name: "Sport & Loisirs",
    shortName: "Sport",
    description: "Équipements de sport, ballons, raquettes et nutrition sportive.",
    tone: "bg-orange-50 text-orange-700",
    subcategories: [
      { slug: "sports-collectifs", name: "Sports collectifs" },
      { slug: "raquettes-golf", name: "Raquettes & golf" },
      { slug: "nutrition-sportive", name: "Nutrition sportive" },
    ],
  },
  {
    slug: "auto-moto",
    name: "Auto & Moto",
    shortName: "Moto",
    description: "Motos et scooters neufs avec garantie constructeur.",
    tone: "bg-zinc-100 text-zinc-700",
    subcategories: [{ slug: "motos-scooters", name: "Motos & scooters" }],
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export function subcategoryName(category: string, sub: string): string {
  return CATEGORY_BY_SLUG[category]?.subcategories.find((s) => s.slug === sub)?.name ?? sub;
}
