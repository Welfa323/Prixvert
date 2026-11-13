import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

/**
 * Logo Prixvert — fichiers générés depuis le logo officiel (fond transparent) :
 *   public/brand/prixvert-mark(-white).png      emblème (caddie « V » + « P » dans le cercle)
 *   public/brand/prixvert-wordmark(-white).png  mot « Prixvert »
 *   public/brand/prixvert-logo(-white).png      version empilée complète
 * `tone="color"` (vert #8DC63F) convient sur fond clair ou très sombre ;
 * `tone="white"` est réservé aux fonds verts / photos.
 */
type Tone = "color" | "white";

const src = (name: "mark" | "wordmark" | "logo", tone: Tone) => `/brand/prixvert-${name}${tone === "white" ? "-white" : ""}.png`;

export function LogoMark({ className, tone = "color" }: { className?: string; tone?: Tone }) {
  return <Image src={src("mark", tone)} alt="" aria-hidden width={350} height={352} className={cn("size-9 shrink-0 object-contain", className)} />;
}

export function LogoWordmark({ className, tone = "color" }: { className?: string; tone?: Tone }) {
  return <Image src={src("wordmark", tone)} alt="Prixvert" width={438} height={88} className={cn("h-5 w-auto object-contain", className)} />;
}

/** Logo complet (emblème au-dessus du mot), pour les grands formats */
export function LogoStacked({ className, tone = "color" }: { className?: string; tone?: Tone }) {
  return <Image src={src("logo", tone)} alt="Prixvert" width={438} height={428} className={cn("h-32 w-auto object-contain", className)} />;
}

export function Logo({ className, tone = "color", href = "/" }: { className?: string; tone?: Tone; href?: string }) {
  return (
    <Link href={href} className={cn("flex shrink-0 items-center gap-2", className)} aria-label="Prixvert — accueil">
      <LogoMark className="size-10" tone={tone} />
      <LogoWordmark className="h-[22px]" tone={tone} />
    </Link>
  );
}
