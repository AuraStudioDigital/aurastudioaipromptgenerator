import { Copy, Check, Sparkles, RefreshCw, Target } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PromptOutputProps {
  prompt: string;
  isLoading: boolean;
  onRefine: () => void;
  onAdVersion: () => void;
  isRefining: boolean;
}

const PromptOutput = ({ prompt, isLoading, onRefine, onAdVersion, isRefining }: PromptOutputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prompt && !isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Prompt Gerado
        </h3>
        {prompt && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        )}
      </div>

      <div className="relative rounded-xl border border-border bg-card p-5 font-mono text-sm leading-relaxed text-secondary-foreground min-h-[120px]">
        {isLoading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {isRefining ? "Refinando prompt..." : "Analisando imagem e gerando prompt..."}
          </div>
        ) : (
          prompt
        )}
      </div>

      {prompt && !isLoading && (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onRefine}
            variant="outline"
            className="border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refinar Prompt
          </Button>
          <Button
            onClick={onAdVersion}
            className="bg-accent hover:bg-accent/90 text-accent-foreground glow-accent"
          >
            <Target className="w-4 h-4 mr-2" />
            Versão para Anúncio (Alta Conversão)
          </Button>
        </div>
      )}
    </div>
  );
};

export default PromptOutput;
