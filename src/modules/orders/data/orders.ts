import { getAllProducts, type Product } from "@/modules/catalog";
import { CUSTOMERS } from "@/modules/crm";
import { CARRIERS, ZONES } from "@/modules/delivery";
import type { PaymentMethodId } from "@/modules/payment";
import { DEMO_NOW, DAY_MS } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";
import { ORDER_FLOW } from "../status";
import type { Order, OrderEvent, OrderItem, OrderStatus, SalesChannel } from "../types";

const PAYMENTS: PaymentMethodId[] = ["orange_money", "orange_money", "mtn_momo", "wave", "wave", "livraison", "livraison", "carte", "moov_money", "virement", "plusieurs_fois"];
const CHANNELS: SalesChannel[] = ["Site web", "Site web", "Application", "Application", "WhatsApp", "Boutique", "Facebook"];
const STORES = ["cocody", "marcory", "yopougon", "entrepot-abidjan", "entrepot-bouake"];
const ACTORS = ["Système", "Awa Touré", "Serge Bamba", "Mariam Coulibaly", "Ibrahim Ouattara"];

function buildHistory(status: OrderStatus, created: Date, r: ReturnType<typeof seeded>, method: PaymentMethodId): OrderEvent[] {
  const events: OrderEvent[] = [];
  let t = created.getTime();
  const push = (s: OrderStatus, note?: string) => {
    events.push({ status: s, at: new Date(t).toISOString(), by: s === "nouvelle" || s === "payee" ? "Système" : r.pick(ACTORS), note });
    t += r.int(20, 600) * 60_000;
  };
  const terminal: OrderStatus[] = ["annulee", "echec_paiement", "retour", "remboursee"];
  const target = terminal.includes(status)
    ? status === "annulee" || status === "echec_paiement"
      ? "paiement_en_attente"
      : "livree"
    : status;
  const skipPending = method !== "livraison" && method !== "virement";
  for (const s of ORDER_FLOW) {
    if (s === "paiement_en_attente" && skipPending && target !== "paiement_en_attente") continue;
    if (s === "payee" && method === "livraison" && ORDER_FLOW.indexOf(target) < ORDER_FLOW.indexOf("livree")) continue;
    push(s, s === "payee" ? "Paiement confirmé automatiquement" : s === "expediee" ? "Remis au transporteur" : undefined);
    if (s === target) break;
  }
  if (status === "annulee") push("annulee", r.pick(["Annulée par le client", "Rupture de stock fournisseur", "Client injoignable"]));
  if (status === "echec_paiement") push("echec_paiement", "Transaction refusée par l'opérateur");
  if (status === "retour") push("retour", r.pick(["Taille non adaptée", "Produit endommagé à la réception", "Ne correspond pas à la description"]));
  if (status === "remboursee") {
    push("retour", "Article défectueux");
    push("remboursee", "Remboursement Mobile Money effectué");
  }
  // Les dates ne doivent pas dépasser « maintenant »
  return events.map((e) => (new Date(e.at) > DEMO_NOW ? { ...e, at: DEMO_NOW.toISOString() } : e));
}

function statusForAge(days: number, r: ReturnType<typeof seeded>): OrderStatus {
  if (days === 0) return r.pick(["nouvelle", "nouvelle", "paiement_en_attente", "payee", "payee", "en_preparation", "prete", "expediee", "echec_paiement"]);
  if (days <= 2) return r.pick(["en_preparation", "prete", "expediee", "en_livraison", "en_livraison", "livree", "annulee"]);
  if (days <= 5) return r.pick(["en_livraison", "livree", "livree", "livree", "retour", "annulee"]);
  return r.pick(["livree", "livree", "livree", "livree", "livree", "livree", "livree", "annulee", "remboursee", "retour", "echec_paiement"]);
}

function pickItems(r: ReturnType<typeof seeded>, products: Product[], favorite?: string): OrderItem[] {
  const n = r.pick([1, 1, 1, 2, 2, 3, 4]);
  const pool = products.filter((p) => p.price < 900_000 && p.availability !== "coming_soon");
  const items: OrderItem[] = [];
  for (let i = 0; i < n; i++) {
    const p = favorite && i === 0 ? (pool.find((x) => x.subcategory.includes(favorite)) ?? r.pick(pool)) : r.pick(pool);
    if (items.some((it) => it.productId === p.id)) continue;
    const opt = p.options[0];
    items.push({
      productId: p.id,
      name: p.name,
      image: p.images[0],
      variant: opt ? opt.values[r.int(0, opt.values.length - 1)].label : undefined,
      qty: p.price < 15000 ? r.int(1, 4) : 1,
      unitPrice: p.price,
      unitCost: p.costPrice,
      category: p.category,
    });
  }
  return items;
}

function makeOrder(seq: number, created: Date, customerIdx: number, r: ReturnType<typeof seeded>, forced?: Partial<Order>): Order {
  const products = getAllProducts();
  const c = CUSTOMERS[customerIdx];
  const days = Math.floor((DEMO_NOW.getTime() - created.getTime()) / DAY_MS);
  const status = forced?.status ?? statusForAge(days, r);
  const zone = c.city === "Abidjan" ? (ZONES.find((z) => z.name === c.commune) ?? ZONES[0]) : (ZONES.find((z) => z.name === c.city) ?? ZONES[14]);
  const items = forced?.items ?? pickItems(r, products, customerIdx === 0 ? r.pick(["chaussures", "montres", "sacs"]) : undefined);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const promo = r.chance(0.22) ? r.pick(["AKWABA5000", "BIENVENUE10", "CHAUSSURES20", "LIVRAISON0"]) : undefined;
  const discount = promo === "AKWABA5000" && subtotal >= 30000 ? 5000 : promo === "BIENVENUE10" ? Math.min(15000, Math.round(subtotal * 0.1)) : promo === "CHAUSSURES20" ? Math.round(subtotal * 0.08) : 0;
  const deliveryMode = r.pick(["standard", "standard", "standard", "express", "retrait", "relais", "programmee"] as const);
  const shippingFee = deliveryMode === "retrait" || promo === "LIVRAISON0" || (subtotal >= 50000 && zone.group === "abidjan" && deliveryMode === "standard") ? 0 : zone.fee + (deliveryMode === "express" ? 2000 : deliveryMode === "programmee" ? 1000 : 0);
  const total = subtotal - discount + shippingFee;
  const paymentMethod = forced?.paymentMethod ?? r.pick(PAYMENTS);
  const paid = ["payee", "en_preparation", "prete", "expediee", "en_livraison", "livree", "retour", "remboursee"].includes(status) && !(paymentMethod === "livraison" && status !== "livree");
  const shipped = ["expediee", "en_livraison", "livree", "retour", "remboursee"].includes(status);
  const ymd = created.toISOString().slice(2, 10).replace(/-/g, "");
  return {
    id: `o${seq}`,
    number: `PV-${ymd}-${String(seq).padStart(4, "0")}`,
    customerId: c.id,
    customerName: c.name,
    phone: c.phone,
    email: c.email,
    items,
    subtotal,
    discount,
    promoCode: discount ? promo : promo === "LIVRAISON0" ? promo : undefined,
    shippingFee,
    total,
    paymentMethod,
    paymentRef: paid ? `${paymentMethod === "carte" ? "CB" : "MM"}-${(seq * 7919).toString(36).toUpperCase()}` : undefined,
    paidAmount: paid ? (paymentMethod === "plusieurs_fois" ? Math.ceil(total / 3) : total) : 0,
    deliveryMode,
    zoneId: zone.id,
    city: c.city === "Abidjan" ? `Abidjan · ${c.commune}` : c.city,
    address: customerIdx === 0 ? "Riviera Palmeraie, rue I 45, villa 12" : `${c.commune}, ${r.pick(["près du marché", "rue des jardins", "cité SIR", "face station Total", "derrière l'église", "carrefour pharmacie"])}`,
    carrier: shipped ? (deliveryMode === "retrait" ? undefined : r.pick(CARRIERS)) : undefined,
    trackingNumber: shipped && deliveryMode !== "retrait" ? `TRK${(seq * 104729).toString().slice(0, 9)}CI` : undefined,
    status,
    history: buildHistory(status, created, r, paymentMethod),
    internalComment: r.chance(0.15) ? r.pick(["Client VIP — emballage cadeau", "Appeler avant livraison", "Adresse difficile, demander point de repère", "Vérifier la pointure avant envoi"]) : undefined,
    channel: r.pick(CHANNELS),
    storeId: zone.id === "bouake" ? "entrepot-bouake" : r.pick(STORES.slice(0, 4)),
    createdAt: created.toISOString(),
    ...forced,
  };
}

function generate(): Order[] {
  const r = seeded(2026);
  const orders: Order[] = [];
  let seq = 4300;
  // ~ 8 commandes / jour sur 60 jours (échantillon affiché dans le back-office)
  for (let d = 60; d >= 0; d--) {
    const perDay = d === 0 ? 16 : r.int(4, 11);
    for (let k = 0; k < perDay; k++) {
      const created = new Date(DEMO_NOW.getTime() - d * DAY_MS);
      created.setUTCHours(d === 0 ? r.int(7, 14) : r.int(7, 22), r.int(0, 59), 0, 0);
      const customerIdx = r.chance(0.05) ? 0 : r.int(1, CUSTOMERS.length - 1);
      orders.push(makeOrder(seq++, created, customerIdx, r));
    }
  }
  return orders;
}

const GENERATED = generate();

/** Les 17 commandes de Jean Kouassi (compte de démonstration) */
function jeanOrders(): Order[] {
  const r = seeded(17);
  const products = getAllProducts();
  const find = (slug: string) => products.find((p) => p.slug === slug)!;
  const item = (slug: string, qty = 1, variant?: string): OrderItem => {
    const p = find(slug);
    return { productId: p.id, name: p.name, image: p.images[0], qty, unitPrice: p.price, unitCost: p.costPrice, category: p.category, variant };
  };
  const plan: { days: number; status: OrderStatus; items: OrderItem[]; pay: PaymentMethodId }[] = [
    { days: 0, status: "en_livraison", items: [item("nike-air-jordan-1-rouge-et-noir", 1, "42"), item("lunettes-de-soleil-noires")], pay: "wave" },
    { days: 3, status: "expediee", items: [item("apple-airpods"), item("chargeur-rapide-iphone-20w")], pay: "orange_money" },
    { days: 14, status: "livree", items: [item("montre-bracelet-cuir-marron", 1, "Marron"), item("chemise-a-carreaux-homme", 2, "L")], pay: "carte" },
    { days: 34, status: "livree", items: [item("sac-a-main-noir", 1, "Noir"), item("dior-j-adore", 1, "50 ml")], pay: "mtn_momo" },
    { days: 45, status: "remboursee", items: [item("baskets-puma-future-rider", 1, "43")], pay: "wave" },
    { days: 57, status: "livree", items: [item("blender-1-5-l"), item("poele-antiadhesive-28-cm")], pay: "livraison" },
    { days: 71, status: "annulee", items: [item("samsung-galaxy-s10", 1, "128 Go")], pay: "orange_money" },
    { days: 88, status: "livree", items: [item("sneakers-off-white-et-rouge", 1, "42")], pay: "carte" },
    { days: 102, status: "livree", items: [item("riz-parfume-5-kg", 2), item("huile-de-cuisson-5-l"), item("cafe-nescafe-classic", 2)], pay: "livraison" },
    { days: 120, status: "livree", items: [item("sac-cuir-heshe", 1, "Marron")], pay: "wave" },
    { days: 141, status: "livree", items: [item("t-shirt-homme-aorus", 3, "M")], pay: "orange_money" },
    { days: 160, status: "livree", items: [item("four-micro-ondes-25-l", 1, "Blanc")], pay: "carte" },
    { days: 188, status: "livree", items: [item("calvin-klein-ck-one")], pay: "mtn_momo" },
    { days: 214, status: "livree", items: [item("crampons-nike-pro", 1, "42"), item("ballon-de-football")], pay: "wave" },
    { days: 240, status: "livree", items: [item("lenovo-yoga-920", 1, "8 Go RAM · 256 Go SSD")], pay: "plusieurs_fois" },
    { days: 290, status: "livree", items: [item("montre-doree-femme", 1, "Or")], pay: "carte" },
    { days: 330, status: "livree", items: [item("apple-watch-series-4-or")], pay: "orange_money" },
  ];
  return plan.map((p, i) => {
    const created = new Date(DEMO_NOW.getTime() - p.days * DAY_MS);
    created.setUTCHours(9 + (i % 10), 15 + i, 0, 0);
    return makeOrder(8017 - i, created, 0, r, {
      status: p.status,
      items: p.items,
      paymentMethod: p.pay,
      ...(p.days === 0 ? { deliveryMode: "standard", carrier: "Prixvert Express (interne)", trackingNumber: "TRK478100217CI", zoneId: "cocody", city: "Abidjan · Cocody" } : {}),
    });
  });
}

export const JEAN_ORDERS = jeanOrders();

export const ORDERS: Order[] = [...GENERATED.filter((o) => o.customerId !== "c001"), ...JEAN_ORDERS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
