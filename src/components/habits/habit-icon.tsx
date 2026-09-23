import {
  BookOpen,
  Brain,
  Coffee,
  Droplets,
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  flame: Flame,
  book: BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  moon: Moon,
  sun: Sun,
  leaf: Leaf,
  droplets: Droplets,
  brain: Brain,
  coffee: Coffee,
};

export function HabitIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = (name && map[name]) || Flame;
  return <Icon className={className} />;
}
