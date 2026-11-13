import seed from "./seed.json";
import type { Availability, Product, VariantOption } from "../types";
import { seeded, slugify } from "@/shared/lib/utils";
import { daysAgo, daysFromNow } from "@/shared/lib/clock";

interface SeedItem {
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  rating: number;
  images: string[];
}

export const COLOR_HEX: Record<string, string> = {
  Noir: "#111827",
  Blanc: "#f8fafc",
  Bleu: "#2563eb",
  "Bleu nuit": "#1e3a8a",
  Rouge: "#dc2626",
  Vert: "#059669",
  Or: "#d4a72c",
  Argent: "#c0c4cc",
  Gris: "#6b7280",
  Rose: "#ec4899",
  Marron: "#92400e",
  Beige: "#e7d7b8",
  Prune: "#7e3a6d",
  Violet: "#7c3aed",
  Jaune: "#facc15",
};

const PRICE_OVERRIDES: Record<string, number> = {
  "eau-minerale-pack-6x1-5-l": 2500,
  "sodas-assortis-pack-6": 3900,
  "pommes-rouges-1-kg": 2900,
  "oignons-rouges-1-kg": 1500,
  "riz-parfume-5-kg": 5900,
  "huile-de-cuisson-5-l": 7900,
  "lait-entier-1-l": 1200,
  "ufs-frais-x30": 3500,
};

const SLUG_OVERRIDES: Record<string, string> = { "ufs-frais-x30": "oeufs-frais-x30" };

/* -------------------------------------------------------------- textes */

const DESCRIPTIONS: Record<string, (p: SeedItem) => string> = {
  smartphones: (p) =>
    `Le ${p.name} associe performances, autonomie et appareil photo de qualité pour accompagner toutes vos journées. Écran lumineux, charge rapide et double SIM : il est pensé pour un usage intensif, des appels WhatsApp aux réseaux sociaux. Livré avec câble de charge et garantie ${p.brand} officielle.`,
  tablettes: (p) =>
    `La ${p.name} est idéale pour travailler, apprendre ou se divertir partout. Grand écran immersif, haut-parleurs stéréo et autonomie d'une journée complète.`,
  "accessoires-telephone": (p) =>
    `${p.name} : l'accessoire indispensable pour profiter pleinement de votre smartphone. Qualité certifiée, compatible avec la plupart des modèles récents.`,
  "ordinateurs-portables": (p) =>
    `Le ${p.name} offre la puissance nécessaire pour la bureautique, la création et le multitâche. Châssis fin et léger, écran haute définition et SSD ultra-rapide pour un démarrage en quelques secondes.`,
  audio: (p) =>
    `${p.name} : un son riche et équilibré, une connexion sans fil stable et une autonomie confortable. Parfait pour la musique, les appels et les séries.`,
  "objets-connectes": (p) =>
    `${p.name} suit votre activité, vos notifications et votre santé au quotidien. Design élégant et résistant à l'eau.`,
  "chemises-tshirts": (p) =>
    `${p.name} en tissu respirant, coupe moderne et finitions soignées. Idéale pour le bureau comme pour les sorties, elle se porte facilement sous la chaleur d'Abidjan.`,
  "chaussures-homme": (p) =>
    `${p.name} : confort, maintien et style. Semelle amortissante et matériaux durables pour une utilisation quotidienne.`,
  "chaussures-femme": (p) =>
    `${p.name} pour sublimer vos tenues. Confortables, élégantes et faciles à assortir.`,
  "montres-homme": (p) =>
    `${p.name} : une montre au caractère affirmé, mouvement de précision et finitions haut de gamme. Livrée dans son écrin avec certificat d'authenticité.`,
  "montres-femme": (p) =>
    `${p.name}, l'élégance au poignet. Boîtier raffiné, bracelet confortable et mouvement fiable.`,
  "accessoires-homme": (p) => `${p.name} avec protection UV400 et monture légère, pour un look affirmé sous le soleil.`,
  robes: (p) => `${p.name} : une pièce forte pour vos cérémonies et soirées. Coupe flatteuse et tissu de qualité.`,
  "hauts-robes-ete": (p) => `${p.name}, légère et fluide, parfaite pour les journées ensoleillées.`,
  sacs: (p) => `${p.name} : spacieux, élégant et pratique, avec plusieurs compartiments pour organiser vos essentiels.`,
  bijoux: (p) => `${p.name}, fabriquées à la main par des artisans partenaires. Légères et hypoallergéniques.`,
  maquillage: (p) => `${p.name} : tenue longue durée, texture agréable et rendu professionnel.`,
  parfums: (p) => `${p.name}, un sillage inoubliable. Parfum 100 % authentique, importé directement du distributeur officiel.`,
  "soins-corps": (p) => `${p.name} hydrate et protège votre peau au quotidien. Adapté aux climats chauds et humides.`,
  electromenager: (p) => `${p.name} : performant, économe en énergie et simple d'utilisation. Garantie et service après-vente à Abidjan.`,
  cuisine: (p) => `${p.name}, l'ustensile robuste pour cuisiner vos plats préférés, de l'attiéké au kedjenou.`,
  meubles: (p) => `${p.name} : design soigné et matériaux nobles pour sublimer votre intérieur. Livraison et montage inclus à Abidjan.`,
  decoration: (p) => `${p.name} pour apporter une touche chaleureuse à votre maison.`,
  epicerie: (p) => `${p.name}, produit de qualité sélectionné pour vos courses du quotidien.`,
  "produits-frais": (p) => `${p.name}, livré frais grâce à notre chaîne du froid.`,
  "fruits-legumes": (p) => `${p.name}, sélectionnés chaque matin auprès de producteurs locaux.`,
  boissons: (p) => `${p.name}, à servir bien frais.`,
  animalerie: (p) => `${p.name}, une alimentation complète et équilibrée pour votre compagnon.`,
  "sports-collectifs": (p) => `${p.name} : qualité match, résistant et adapté à tous les terrains.`,
  "raquettes-golf": (p) => `${p.name} pour progresser et prendre du plaisir à chaque séance.`,
  "nutrition-sportive": (p) => `${p.name} : 24 g de protéines par dose pour soutenir votre récupération.`,
  "motos-scooters": (p) => `${p.name} : fiable, économique en carburant et idéale pour circuler en ville comme sur route. Garantie constructeur 12 mois, immatriculation possible sur demande.`,
};

const HIGHLIGHTS: Record<string, string[]> = {
  smartphones: ["Double SIM 4G/5G", "Charge rapide", "Appareil photo haute résolution", "Garantie 12 mois"],
  tablettes: ["Écran haute définition", "Autonomie 10 h", "Haut-parleurs stéréo"],
  "ordinateurs-portables": ["SSD ultra-rapide", "Écran haute définition", "Clavier rétroéclairé", "Windows / macOS installé"],
  audio: ["Bluetooth 5.0", "Réduction de bruit", "Autonomie longue durée"],
  "chaussures-homme": ["Semelle amortissante", "Matériaux respirants", "Retour gratuit 7 jours"],
  "chaussures-femme": ["Confort longue durée", "Échange de taille gratuit"],
  parfums: ["100 % authentique", "Flacon scellé", "Échantillon offert"],
  electromenager: ["Garantie 12 mois", "SAV à Abidjan", "Faible consommation"],
  meubles: ["Livraison & montage inclus", "Bois massif", "Garantie 24 mois"],
  "motos-scooters": ["Garantie constructeur", "Carte grise sur demande", "Livraison sur Abidjan"],
};

const COUNTRY: Record<string, string> = {
  Apple: "États-Unis",
  Samsung: "Corée du Sud",
  Oppo: "Chine",
  Realme: "Chine",
  Vivo: "Chine",
  Huawei: "Chine",
  Lenovo: "Chine",
  Asus: "Taïwan",
  Dell: "États-Unis",
  Nike: "États-Unis",
  Puma: "Allemagne",
  Rolex: "Suisse",
  Longines: "Suisse",
  IWC: "Suisse",
  Chanel: "France",
  Dior: "France",
  Gucci: "Italie",
  Prada: "Italie",
  Kawasaki: "Japon",
};
const LOCAL_BRANDS = ["Lagune Fresh", "Baobab Kitchen", "Akwaba Home", "Akwaba Bijoux", "Ivoire Sport", "Wax & Co", "Pagne Chic"];

/* -------------------------------------------------------------- variantes */

function buildOptions(p: SeedItem, rnd: ReturnType<typeof seeded>): VariantOption[] {
  const colorSet = (names: string[]) => ({
    name: "Couleur",
    values: names.map((n) => ({ label: n, hex: COLOR_HEX[n] ?? "#999", stock: rnd.chance(0.15) ? 0 : rnd.int(2, 20) })),
  });
  const sizes = (labels: string[]) => ({
    name: labels[0].match(/^\d/) ? "Pointure" : "Taille",
    values: labels.map((l) => ({ label: l, stock: rnd.chance(0.18) ? 0 : rnd.int(1, 12) })),
  });

  switch (p.subcategory) {
    case "smartphones":
      return [
        {
          name: "Capacité",
          values: [
            { label: "64 Go" },
            { label: "128 Go", priceDelta: Math.round((p.price * 0.12) / 500) * 500 },
            { label: "256 Go", priceDelta: Math.round((p.price * 0.26) / 500) * 500, stock: rnd.chance(0.4) ? 0 : 4 },
          ],
        },
        colorSet(rnd.shuffle(["Noir", "Blanc", "Bleu", "Vert", "Violet", "Or"]).slice(0, 3)),
      ];
    case "tablettes":
      return [
        { name: "Capacité", values: [{ label: "64 Go" }, { label: "256 Go", priceDelta: Math.round((p.price * 0.2) / 500) * 500 }] },
        colorSet(["Gris", "Argent"]),
      ];
    case "ordinateurs-portables":
      return [
        {
          name: "Modèle",
          values: [
            { label: "8 Go RAM · 256 Go SSD" },
            { label: "16 Go RAM · 512 Go SSD", priceDelta: Math.round((p.price * 0.18) / 5000) * 5000 },
            { label: "32 Go RAM · 1 To SSD", priceDelta: Math.round((p.price * 0.42) / 5000) * 5000, stock: 0 },
          ],
        },
      ];
    case "chemises-tshirts":
      return [sizes(["S", "M", "L", "XL", "XXL"]), colorSet(rnd.shuffle(["Bleu", "Noir", "Blanc", "Rouge", "Vert"]).slice(0, 2))];
    case "robes":
    case "hauts-robes-ete":
      return [sizes(["XS", "S", "M", "L", "XL"])];
    case "chaussures-homme":
      return [sizes(["39", "40", "41", "42", "43", "44", "45"])];
    case "chaussures-femme":
      return [sizes(["36", "37", "38", "39", "40", "41"])];
    case "montres-homme":
    case "montres-femme":
      return [colorSet(["Argent", "Or", "Noir"])];
    case "parfums":
      return [{ name: "Contenance", values: [{ label: "50 ml" }, { label: "100 ml", priceDelta: Math.round((p.price * 0.45) / 500) * 500 }] }];
    case "sacs":
      return [colorSet(rnd.shuffle(["Noir", "Marron", "Beige", "Bleu nuit", "Rouge"]).slice(0, 3))];
    case "motos-scooters":
      return [colorSet(["Noir", "Rouge", "Bleu"])];
    case "electromenager":
      return [colorSet(["Noir", "Blanc"])];
    default:
      return [];
  }
}

/* -------------------------------------------------------------- vidéos */

const VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];
const WITH_VIDEO = new Set([
  "iphone-13-pro",
  "samsung-galaxy-s10",
  "macbook-pro-14-gris-sideral",
  "nike-air-jordan-1-rouge-et-noir",
  "apple-airpods-max-argent",
  "kawasaki-z800",
  "dior-j-adore",
  "four-micro-ondes-25-l",
]);

/** Produits « bientôt disponibles » (précommande / alerte) */
const COMING_SOON: Record<string, number> = {
  "samsung-galaxy-tab-s8-gris": 9,
  "asus-zenbook-pro-duo": 14,
  "rolex-submariner": 21,
  "robe-de-soiree-noire": 6,
  "moto-sportive-250cc": 30,
};
const FLASH = new Set([
  "realme-c35",
  "apple-airpods",
  "blender-1-5-l",
  "baskets-puma-future-rider",
  "gucci-bloom",
  "sac-a-main-noir",
  "oppo-a57",
  "ecouteurs-sans-fil-beats-flex",
  "poele-antiadhesive-28-cm",
  "robe-pea-fleurie",
  "montre-bracelet-cuir-marron",
  "lunettes-de-soleil-noires",
]);
const STORES = ["Boutique Cocody", "Boutique Marcory", "Boutique Yopougon", "Entrepôt central Abidjan"];

const COST_RATIO: Record<string, number> = {
  "telephones-tablettes": 0.82,
  electronique: 0.8,
  "mode-femme": 0.48,
  "mode-homme": 0.5,
  "beaute-sante": 0.55,
  "maison-cuisine": 0.62,
  supermarche: 0.78,
  "sport-loisirs": 0.6,
  "auto-moto": 0.86,
};

function enrich(p: SeedItem, index: number): Product {
  const rnd = seeded(index * 7919 + 17);
  const slug = SLUG_OVERRIDES[p.slug] ?? p.slug;
  const price = PRICE_OVERRIDES[p.slug] ?? p.price;
  const isFlash = FLASH.has(slug);
  const hasPromo = isFlash || rnd.chance(0.38);
  const discountPct = hasPromo ? (isFlash ? rnd.int(25, 45) : rnd.pick([10, 12, 15, 18, 20, 25, 30, 35])) : undefined;
  // Prix barré cohérent : prix actuel = prix de référence − remise
  const compareAtPrice = discountPct ? Math.round(price / (1 - discountPct / 100) / 100) * 100 : undefined;

  const comingInDays = COMING_SOON[slug];
  let stock = rnd.chance(0.07) ? 0 : rnd.chance(0.14) ? rnd.int(1, 5) : rnd.int(8, 140);
  if (comingInDays) stock = 0;
  const availability: Availability = comingInDays ? "coming_soon" : stock === 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock";

  const options = buildOptions(p, rnd);
  const colorOpt = options.find((o) => o.name === "Couleur");
  const sizeOpt = options.find((o) => o.name === "Taille" || o.name === "Pointure");

  const createdDaysAgo = rnd.chance(0.22) ? rnd.int(1, 25) : rnd.int(30, 420);
  const soldCount = Math.round(rnd.int(5, 900) * (price < 20000 ? 2.2 : price > 1_000_000 ? 0.05 : 1));
  const reviewCount = Math.max(0, Math.round(soldCount * rnd.next() * 0.25));
  const isLocal = LOCAL_BRANDS.includes(p.brand);
  const warrantyMonths = ["telephones-tablettes", "electronique", "auto-moto"].includes(p.category)
    ? 12
    : p.subcategory === "electromenager" || p.subcategory === "meubles"
      ? 24
      : p.subcategory.startsWith("montres")
        ? 24
        : 0;
  const weightKg = p.category === "auto-moto" ? rnd.int(95, 210) : p.subcategory === "meubles" ? rnd.int(15, 60) : Math.round((0.1 + rnd.next() * 3) * 10) / 10;
  const sku = `PV-${p.category.slice(0, 3).toUpperCase()}-${String(1000 + index).padStart(4, "0")}`;

  const specs = [
    { label: "Marque", value: p.brand },
    { label: "Référence", value: sku },
    { label: "Origine", value: isLocal ? "Côte d'Ivoire" : (COUNTRY[p.brand] ?? "Importé") },
    { label: "Poids", value: `${String(weightKg).replace(".", ",")} kg` },
    { label: "Garantie", value: warrantyMonths ? `${warrantyMonths} mois` : "Satisfait ou remboursé 7 jours" },
    ...options.map((o) => ({ label: o.name, value: o.values.map((v) => v.label).join(", ") })),
  ];

  return {
    id: `p${String(index + 1).padStart(3, "0")}`,
    sku,
    slug,
    name: p.name,
    brand: slugify(p.brand),
    brandName: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    price,
    compareAtPrice,
    discountPct,
    costPrice: Math.round((price * (COST_RATIO[p.category] ?? 0.65) * (0.9 + rnd.next() * 0.2)) / 100) * 100,
    images: p.images,
    video: WITH_VIDEO.has(slug) ? VIDEOS[index % VIDEOS.length] : undefined,
    rating: p.rating,
    reviewCount,
    soldCount,
    stock,
    availability,
    availableAt: comingInDays ? daysFromNow(comingInDays).toISOString() : undefined,
    isNew: createdDaysAgo <= 25 || Boolean(comingInDays),
    isFlashSale: isFlash && stock > 0,
    flashSoldPct: isFlash ? rnd.int(35, 92) : undefined,
    createdAt: daysAgo(createdDaysAgo).toISOString(),
    options,
    colors: colorOpt?.values.map((v) => v.label) ?? [],
    sizes: sizeOpt?.values.map((v) => v.label) ?? [],
    description: (DESCRIPTIONS[p.subcategory] ?? ((x: SeedItem) => `${x.name}, sélectionné par nos équipes.`))(p),
    highlights: HIGHLIGHTS[p.subcategory] ?? ["Produit vérifié par Prixvert", "Livraison rapide", "Retour gratuit 7 jours"],
    specs,
    tags: [p.subcategory, p.category, p.brand.toLowerCase(), ...(isLocal ? ["made in ci", "local"] : [])],
    warrantyMonths,
    weightKg,
    sellerStore: STORES[index % STORES.length],
  };
}

export const PRODUCTS: Product[] = (seed as SeedItem[]).map(enrich);
