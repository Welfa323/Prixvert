/**
 * Module Avis clients : note /5, commentaire, photos, avis vérifiés, réponse et modération.
 */
import { getAllProducts, type Product } from "@/modules/catalog";
import { CUSTOMERS } from "@/modules/crm";
import { daysAgo } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  hasVideo: boolean;
  verified: boolean;
  helpful: number;
  createdAt: string;
  status: "publie" | "en_attente" | "masque";
  reply?: { author: string; message: string; at: string };
  flagged?: boolean;
}

const POSITIVE: [string, string][] = [
  ["Très satisfait !", "Produit conforme à la description, livré en moins de 24 h à Cocody. Je recommande vivement."],
  ["Top qualité", "Franchement je ne m'attendais pas à une telle qualité pour ce prix. Emballage soigné."],
  ["Livraison rapide", "Commandé le matin, reçu l'après-midi. Le livreur était très courtois. Merci Prixvert !"],
  ["Parfait", "Exactement ce que je cherchais. J'ai payé avec Wave, aucun souci."],
  ["Je recommande", "Deuxième achat sur le site, toujours aussi sérieux. Le suivi de commande est très pratique."],
  ["Excellent rapport qualité/prix", "Acheté pendant les ventes flash, une vraie affaire."],
];
const MIXED: [string, string][] = [
  ["Bien mais…", "Le produit est bien, mais la livraison a pris un jour de plus que prévu à Yopougon."],
  ["Correct", "Conforme dans l'ensemble, la couleur est un peu différente de la photo."],
  ["Bon produit", "Rien à redire sur le produit, l'emballage pourrait être amélioré."],
];
const NEGATIVE: [string, string][] = [
  ["Déçu", "La taille ne correspond pas du tout, j'ai dû faire un retour. Le remboursement a été rapide par contre."],
  ["Pas terrible", "Qualité moyenne pour le prix. Le service client a quand même été réactif."],
];

function build(): Review[] {
  const reviews: Review[] = [];
  getAllProducts().forEach((p, pi) => {
    const r = seeded(pi * 97 + 3);
    const n = Math.min(7, Math.max(p.reviewCount > 0 ? 2 : 0, Math.round(p.reviewCount / 12)));
    for (let k = 0; k < n; k++) {
      const roll = r.next();
      const rating = p.rating >= 4.4 ? (roll < 0.75 ? 5 : roll < 0.93 ? 4 : 3) : roll < 0.45 ? 5 : roll < 0.75 ? 4 : roll < 0.9 ? 3 : r.pick([1, 2]);
      const [title, comment] = rating >= 4 ? r.pick(POSITIVE) : rating === 3 ? r.pick(MIXED) : r.pick(NEGATIVE);
      const c = CUSTOMERS[r.int(1, CUSTOMERS.length - 1)];
      const withPhoto = r.chance(0.3) && p.images.length > 1;
      const status: Review["status"] = r.chance(0.06) ? "en_attente" : rating <= 2 && r.chance(0.2) ? "masque" : "publie";
      const at = daysAgo(r.int(1, 200), r.int(8, 22));
      reviews.push({
        id: `rv-${p.id}-${k}`,
        productId: p.id,
        productName: p.name,
        productImage: p.images[0],
        author: `${c.name.split(" ")[0]} ${c.name.split(" ")[1]?.[0] ?? ""}.`,
        city: c.commune,
        rating,
        title,
        comment,
        photos: withPhoto ? [p.images[1]] : [],
        hasVideo: r.chance(0.05),
        verified: r.chance(0.85),
        helpful: r.int(0, 42),
        createdAt: at.toISOString(),
        status,
        flagged: status === "masque",
        reply:
          rating <= 3 || r.chance(0.15)
            ? {
                author: "Service client Prixvert",
                message: rating <= 3 ? `Merci pour votre retour ${c.name.split(" ")[0]}. Nous sommes désolés pour ce désagrément, notre équipe vous contacte sur WhatsApp pour trouver une solution.` : "Merci beaucoup pour votre confiance, à très bientôt sur Prixvert !",
                at: new Date(at.getTime() + 86_400_000).toISOString(),
              }
            : undefined,
      });
    }
  });
  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const REVIEWS = build();

export function getProductReviews(product: Product) {
  return REVIEWS.filter((r) => r.productId === product.id && r.status === "publie");
}

export function ratingDistribution(product: Product) {
  // Distribution cohérente avec la note moyenne et le nombre d'avis du produit
  const total = product.reviewCount;
  const avg = product.rating;
  const weights = [1, 2, 3, 4, 5].map((s) => Math.exp(-Math.pow(s - avg, 2) * 1.4));
  const sumW = weights.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: Math.round((weights[s - 1] / sumW) * total) }));
}
