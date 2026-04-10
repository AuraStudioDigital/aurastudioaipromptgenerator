import { useState } from "react";
import { History, X, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HistoryItem {
  id: string;
  imagePreview: string;
  prompt: string;
  style: string;
  createdAt: string;
}

interface PromptHistoryProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const PromptHistory = ({ items, onDelete, onClearAll }: PromptHistoryProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selected = items.find((i) => i.id === selectedId);

  const handleCopy = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">Nenhum prompt no histórico</p>
        <p className="text-sm mt-1">Gere seu primeiro prompt para vê-lo aqui</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid de imagens */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{items.length} prompt(s) salvo(s)</p>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar tudo
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-200 aspect-square"
            >
              <img src={item.imagePreview} alt="Referência" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-foreground font-medium capitalize">{item.style}</span>
                <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal do prompt */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedId(null)}>
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedId(null)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>

            <img src={selected.imagePreview} alt="Referência" className="w-full max-h-[300px] object-contain rounded-xl bg-background" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground capitalize">Estilo: {selected.style}</p>
                <p className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(selected.prompt)}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { onDelete(selected.id); setSelectedId(null); }} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed text-secondary-foreground">
              {selected.prompt}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptHistory;
