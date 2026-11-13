import { Bike, Dumbbell, Laptop, Shirt, ShoppingBasket, Smartphone, Sofa, Sparkles, Gem, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  "telephones-tablettes": Smartphone,
  electronique: Laptop,
  "mode-femme": Gem,
  "mode-homme": Shirt,
  "beaute-sante": Sparkles,
  "maison-cuisine": Sofa,
  supermarche: ShoppingBasket,
  "sport-loisirs": Dumbbell,
  "auto-moto": Bike,
};

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = ICONS[slug] ?? ShoppingBasket;
  return <Icon {...props} />;
}
