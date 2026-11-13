/**
 * Module Contenu : blog (SEO) et pages d'aide.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readMinutes: number;
  cover: string;
  body: { heading?: string; text: string }[];
  productSlugs: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "choisir-smartphone-moins-200000-fcfa",
    title: "Quel smartphone choisir à moins de 200 000 FCFA en 2026 ?",
    excerpt: "Autonomie, photo, stockage : notre sélection des meilleurs téléphones abordables disponibles à Abidjan.",
    category: "Guides d'achat",
    author: "Équipe Prixvert",
    date: "2026-10-18",
    readMinutes: 6,
    cover: "/images/products/realme-c35/1.webp",
    body: [
      { text: "À Abidjan, le smartphone est l'outil du quotidien : WhatsApp, Mobile Money, réseaux sociaux, photos de famille. Bonne nouvelle : il n'est plus nécessaire de dépenser une fortune pour un appareil fiable." },
      { heading: "1. L'autonomie avant tout", text: "Avec les coupures et les longues journées, visez une batterie d'au moins 5 000 mAh et la charge rapide. Le Realme C35 et l'Oppo A57 tiennent facilement une journée et demie." },
      { heading: "2. Le stockage", text: "Les vidéos WhatsApp remplissent vite la mémoire : préférez la version 128 Go, souvent proposée pour quelques milliers de francs de plus." },
      { heading: "3. Le double SIM", text: "Indispensable pour jongler entre Orange, MTN et Moov. Tous les modèles de notre sélection sont double SIM." },
      { heading: "Notre verdict", text: "Pour un premier smartphone ou un cadeau, le Realme C35 offre le meilleur rapport qualité/prix. Pour la photo, l'Oppo F19 Pro+ fait la différence." },
    ],
    productSlugs: ["realme-c35", "oppo-a57", "vivo-s1", "oppo-f19-pro-5g"],
  },
  {
    slug: "tenues-ceremonie-tendances",
    title: "Mariages, baptêmes, dots : les tendances pour vos tenues de cérémonie",
    excerpt: "Wax revisité, ensembles corset, escarpins dorés… comment briller sans se ruiner.",
    category: "Mode",
    author: "Aïcha, styliste partenaire",
    date: "2026-10-05",
    readMinutes: 4,
    cover: "/images/products/robe-pea-fleurie/1.webp",
    body: [
      { text: "La saison des cérémonies bat son plein. Cette année, on mise sur les couleurs vives, les coupes structurées et les accessoires dorés." },
      { heading: "Le wax revisité", text: "Les marques locales comme Wax & Co et Pagne Chic proposent des coupes modernes qui subliment nos tissus traditionnels." },
      { heading: "Les accessoires qui font la différence", text: "Une paire d'escarpins dorés et un sac structuré suffisent à transformer une tenue simple." },
    ],
    productSlugs: ["robe-pea-fleurie", "tailleur-rouge-et-noir", "sandales-dorees-femme", "sac-a-main-noir"],
  },
  {
    slug: "equiper-cuisine-petit-budget",
    title: "Équiper sa cuisine avec un petit budget : la liste essentielle",
    excerpt: "Blender, poêle, marmite… les indispensables pour préparer garba, alloco et sauce graine.",
    category: "Maison",
    author: "Équipe Prixvert",
    date: "2026-09-21",
    readMinutes: 5,
    cover: "/images/products/blender-1-5-l/1.webp",
    body: [
      { text: "Vous emménagez ? Voici la liste des ustensiles qui couvrent 90 % des recettes ivoiriennes, pour moins de 100 000 FCFA." },
      { heading: "Le blender, roi de la cuisine", text: "Piment, tomate, gingembre : un blender de 1,5 L est un investissement rentabilisé en quelques semaines." },
      { heading: "Une bonne marmite inox", text: "Pour les sauces qui mijotent longtemps, l'inox avec couvercle en verre permet de surveiller la cuisson." },
    ],
    productSlugs: ["blender-1-5-l", "marmite-inox-couvercle-verre", "poele-antiadhesive-28-cm", "couteau-de-chef"],
  },
  {
    slug: "payer-mobile-money-en-securite",
    title: "Payer en ligne avec Mobile Money en toute sécurité",
    excerpt: "Orange Money, MTN MoMo, Wave, Moov : comment fonctionne le paiement et comment éviter les arnaques.",
    category: "Conseils",
    author: "Service client",
    date: "2026-09-02",
    readMinutes: 3,
    cover: "/images/products/batterie-magsafe-apple/1.webp",
    body: [
      { text: "Sur Prixvert, le paiement Mobile Money est confirmé automatiquement : vous validez la transaction sur votre téléphone, et c'est tout." },
      { heading: "Ne communiquez jamais votre code secret", text: "Aucun conseiller Prixvert ne vous demandera votre code PIN. La validation se fait uniquement sur votre téléphone." },
      { heading: "En cas d'échec", text: "Si le paiement échoue, aucun montant n'est débité et votre panier est conservé. Vous pouvez réessayer ou payer à la livraison." },
    ],
    productSlugs: [],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export const HELP_PAGES: Record<string, { title: string; intro: string }> = {
  livraison: { title: "Livraison & tarifs", intro: "Nous livrons à Abidjan en 3 h (express) ou 24 h, partout en Côte d'Ivoire sous 2 à 5 jours, et à l'international." },
  paiement: { title: "Moyens de paiement", intro: "Payez comme vous voulez : Mobile Money, carte bancaire, en plusieurs fois, par acompte, par virement ou à la livraison." },
  retours: { title: "Retours & remboursements", intro: "Vous avez 7 jours après la livraison pour changer d'avis. Le retour est gratuit et le remboursement rapide." },
};
