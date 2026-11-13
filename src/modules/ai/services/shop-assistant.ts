/**
 * Assistant client (chatbot) — moteur à intentions + recommandations personnalisées.
 * Interface prête à être branchée sur un LLM : seule `answerCustomer` change.
 */
import { getAllProducts, getPopular, sortProducts, type Product } from "@/modules/catalog";
import { searchProducts } from "@/modules/search";
import { ZONES } from "@/modules/delivery";
import { getOrder } from "@/modules/orders";
import { ORDER_STATUS } from "@/modules/orders/status";
import { formatPrice } from "@/shared/lib/format";
import { normalize } from "@/shared/lib/utils";

export interface AssistantReply {
  text: string;
  products?: Product[];
  links?: { label: string; href: string }[];
  quickReplies?: string[];
}

const CATEGORY_HINTS: [RegExp, string][] = [
  [/telephone|smartphone|portable|iphone|samsung|tel\b/, "smartphones"],
  [/ordi|pc|laptop|macbook/, "ordinateurs-portables"],
  [/ecouteur|casque|airpods|enceinte/, "audio"],
  [/chaussure|basket|sneaker|jordan/, "chaussures"],
  [/robe|tenue|pagne/, "robes"],
  [/parfum/, "parfums"],
  [/montre/, "montres"],
  [/sac/, "sacs"],
  [/mixeur|blender|four|micro|plaque|electromenager/, "electromenager"],
  [/moto|scooter/, "motos-scooters"],
  [/cadeau/, "cadeau"],
];

function parseBudget(t: string): number | undefined {
  const m = t.match(/(\d[\d\s.]*)\s*(k|mille|000|fcfa|f\b|cfa)?/);
  if (!m) return undefined;
  let n = Number(m[1].replace(/[\s.]/g, ""));
  if (m[2] === "k" || m[2] === "mille") n *= 1000;
  return n >= 1000 ? n : undefined;
}

export function answerCustomer(message: string): AssistantReply {
  const t = normalize(message);

  if (/^(bonjour|bonsoir|salut|hello|coucou|akwaba|bjr)/.test(t))
    return {
      text: "Akwaba 👋 Je suis Awa, l'assistante Prixvert. Je peux vous aider à trouver un produit, suivre une commande ou répondre à vos questions sur la livraison et le paiement.",
      quickReplies: ["Un téléphone à moins de 200 000", "Où est ma commande ?", "Frais de livraison", "Moyens de paiement"],
    };

  const orderRef = message.match(/PV-\d{6}-\d{4}/i)?.[0];
  if (orderRef) {
    const o = getOrder(orderRef.toUpperCase());
    if (!o) return { text: `Je ne trouve pas la commande ${orderRef}. Vérifiez le numéro reçu par SMS ou consultez « Mes commandes ».`, links: [{ label: "Mes commandes", href: "/compte/commandes" }] };
    return {
      text: `La commande ${o.number} est actuellement : **${ORDER_STATUS[o.status].customerLabel}**.${o.carrier ? ` Transporteur : ${o.carrier}.` : ""}${o.trackingNumber ? ` N° de suivi : ${o.trackingNumber}.` : ""}`,
      links: [{ label: "Voir le suivi détaillé", href: `/suivi?commande=${o.number}` }],
    };
  }
  if (/suivi|ou est|commande|livre quand|colis/.test(t))
    return {
      text: "Pour suivre une commande, donnez-moi son numéro (ex. PV-261026-8017) ou consultez votre espace client : vous y verrez chaque étape (préparée → expédiée → en route → livrée).",
      links: [{ label: "Suivre ma commande", href: "/suivi" }, { label: "Mes commandes", href: "/compte/commandes" }],
      quickReplies: ["PV-261026-8017"],
    };

  if (/livraison|frais|delai|livrez|livrer/.test(t)) {
    const zone = ZONES.find((z) => t.includes(normalize(z.name)));
    if (zone)
      return {
        text: `Livraison à ${zone.name} : ${formatPrice(zone.fee)} en standard (${zone.maxDays <= 1 ? "24 h" : `${zone.minDays} à ${zone.maxDays} jours`})${zone.expressAvailable ? ", express en 3 h disponible (+2 000 FCFA)" : ""}. Gratuite dès ${formatPrice(zone.group === "abidjan" ? 50000 : 100000)} d'achat.`,
      };
    return {
      text: "À Abidjan : 1 500 FCFA (Cocody, Plateau, Marcory…) à 2 000 FCFA (Yopougon, Abobo…), gratuite dès 50 000 FCFA. Intérieur : 2 500 à 4 500 FCFA selon la ville. Express en 3 h, livraison programmée, point relais et retrait gratuit en boutique sont aussi disponibles.",
      links: [{ label: "Tous les tarifs", href: "/aide/livraison" }],
      quickReplies: ["Livraison à Yopougon", "Livraison à Bouaké"],
    };
  }

  if (/paiement|payer|orange|wave|momo|moov|carte|plusieurs fois|acompte/.test(t))
    return {
      text: "Vous pouvez payer par Orange Money, MTN MoMo, Wave, Moov Money, carte bancaire (Visa/Mastercard), en 3 fois sans frais dès 100 000 FCFA, avec un acompte de 30 %, par virement ou à la livraison. Le paiement Mobile Money est confirmé automatiquement.",
      links: [{ label: "En savoir plus", href: "/aide/paiement" }],
    };

  if (/retour|rembourse|echange|annul/.test(t))
    return {
      text: "Vous disposez de 7 jours après livraison pour retourner un article. Depuis « Mes commandes », cliquez sur « Demander un retour » ; le remboursement est effectué sous 48 h en Mobile Money ou en bon d'achat. Une commande non expédiée peut être annulée en un clic.",
      links: [{ label: "Mes commandes", href: "/compte/commandes" }],
    };

  if (/code|promo|reduction|coupon|bon plan/.test(t))
    return {
      text: "Codes du moment : BIENVENUE10 (−10 % première commande), AKWABA5000 (−5 000 FCFA dès 30 000), CHAUSSURES20 (−20 % sur les chaussures jusqu'au 15 novembre), LIVRAISON0 (livraison offerte jusqu'au 31 octobre).",
      links: [{ label: "Voir les promotions", href: "/collection/promotions" }],
    };

  if (/boutique|magasin|horaire|adresse/.test(t))
    return {
      text: "Nos boutiques : Cocody (Riviera 2, lun–sam 8h30–20h), Marcory (Zone 4, lun–sam 9h–20h) et Yopougon (Siporex, 7j/7 8h–21h). Le retrait en boutique est gratuit et prêt en 2 h.",
    };

  // Recommandations
  const budget = parseBudget(t);
  const hint = CATEGORY_HINTS.find(([re]) => re.test(t))?.[1];
  if (hint || budget || /cherche|recommand|conseil|idee|besoin|veux|voudrais/.test(t)) {
    let pool: Product[];
    if (hint === "cadeau") pool = getAllProducts().filter((p) => ["parfums", "montres-homme", "montres-femme", "bijoux", "sacs", "audio"].includes(p.subcategory));
    else if (hint) pool = getAllProducts().filter((p) => p.subcategory.includes(hint));
    else pool = searchProducts(message).products;
    if (!pool.length) pool = getPopular(30);
    pool = pool.filter((p) => p.availability !== "out_of_stock" && p.availability !== "coming_soon");
    if (budget) pool = pool.filter((p) => p.price <= budget);
    const picks = sortProducts(pool, "popularite").slice(0, 4);
    if (!picks.length) return { text: `Je n'ai rien trouvé${budget ? ` sous ${formatPrice(budget)}` : ""}. Voulez-vous élargir votre budget ?`, quickReplies: ["Les meilleures ventes", "Les promotions"] };
    return {
      text: `Voici ${picks.length} suggestion${picks.length > 1 ? "s" : ""}${budget ? ` à moins de ${formatPrice(budget)}` : ""}, choisies selon les avis et les ventes :`,
      products: picks,
      quickReplies: ["Moins cher", "Livraison à Cocody", "Moyens de paiement"],
    };
  }

  if (/meilleure|top|populaire/.test(t)) return { text: "Les produits les plus populaires en ce moment :", products: getPopular(4) };

  return {
    text: "Je n'ai pas bien compris 🙏 Vous pouvez me demander par exemple : « un téléphone à moins de 150 000 », « livraison à Yopougon » ou « où est ma commande ? ». Un conseiller est aussi joignable sur WhatsApp.",
    quickReplies: ["Une idée cadeau", "Frais de livraison", "Parler à un conseiller"],
  };
}
