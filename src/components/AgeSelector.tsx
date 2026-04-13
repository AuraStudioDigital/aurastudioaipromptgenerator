import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgeSelectorProps {
  age: number;
  onChange: (age: number) => void;
}

const AgeSelector = ({ age, onChange }: AgeSelectorProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(1, age - 1))}
        className="h-10 w-10 rounded-lg border-border"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <div className="flex items-baseline gap-1.5">
        <input
          type="number"
          min={1}
          max={120}
          value={age}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 1 && v <= 120) onChange(v);
          }}
          className="w-16 text-center text-2xl font-bold bg-transparent border-b-2 border-primary/50 text-foreground focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-sm text-muted-foreground">anos</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(120, age + 1))}
        className="h-10 w-10 rounded-lg border-border"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AgeSelector;
