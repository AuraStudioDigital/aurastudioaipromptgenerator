import { Camera, Megaphone, Film, Instagram } from "lucide-react";

const styles = [
  { id: "realistic", label: "Realista", icon: Camera, desc: "Fotografia hiper-realista" },
  { id: "advertising", label: "Publicitário", icon: Megaphone, desc: "Estética de alta conversão" },
  { id: "cinematic", label: "Cinematográfico", icon: Film, desc: "Look de cinema" },
  { id: "instagram", label: "Instagram", icon: Instagram, desc: "Estética de redes sociais" },
] as const;

export type PromptStyle = (typeof styles)[number]["id"];

interface StyleSelectorProps {
  selected: PromptStyle;
  onChange: (style: PromptStyle) => void;
}

const StyleSelector = ({ selected, onChange }: StyleSelectorProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {styles.map(({ id, label, icon: Icon, desc }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
          selected === id
            ? "border-primary bg-primary/10 glow-primary text-primary"
            : "border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
        <span className="text-xs opacity-70">{desc}</span>
      </button>
    ))}
  </div>
);

export default StyleSelector;
