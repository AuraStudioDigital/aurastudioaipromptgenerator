import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wand2, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import AgeSelector from "@/components/AgeSelector";
import StyleSelector, { type PromptStyle } from "@/components/StyleSelector";
import PromptOutput from "@/components/PromptOutput";
import PromptHistory from "@/components/PromptHistory";
import { usePromptHistory } from "@/hooks/usePromptHistory";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState<PromptStyle>("realistic");
  const [age, setAge] = useState(25);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");

  const { items: historyItems, addItem, deleteItem, clearAll } = usePromptHistory();

  const handleImageSelect = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setPrompt("");
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setPrompt("");
  };

  const generatePrompt = async (mode: "generate" | "refine" | "ad" = "generate") => {
    if (!imagePreview) {
      toast.error("Envie uma imagem primeiro");
      return;
    }

    const isRefine = mode === "refine";
    setIsLoading(true);
    setIsRefining(isRefine);

    try {
      const { data, error } = await supabase.functions.invoke("generate-prompt", {
        body: { imageBase64: imagePreview, style, mode, age },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setPrompt(data.prompt);
      addItem(imagePreview, data.prompt, style);
      toast.success(
        mode === "ad"
          ? "Versão para anúncio gerada!"
          : isRefine
          ? "Prompt refinado com sucesso!"
          : "Prompt gerado com sucesso!"
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao gerar prompt. Tente novamente.");
    } finally {
      setIsLoading(false);
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <Header />

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-8">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "generate"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gerar Prompt
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" />
            Histórico
            {historyItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "generate" ? (
          <div className="space-y-8">
            <section className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Imagem de Referência
              </label>
              <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} onClear={handleClear} />
            </section>

            <section className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Idade da Pessoa
              </label>
              <AgeSelector age={age} onChange={setAge} />
            </section>

            <section className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Estilo do Prompt
              </label>
              <StyleSelector selected={style} onChange={setStyle} />
            </section>

            <Button
              onClick={() => generatePrompt("generate")}
              disabled={!imagePreview || isLoading}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold text-base py-6"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Gerar Prompt
            </Button>

            <PromptOutput
              prompt={prompt}
              isLoading={isLoading}
              isRefining={isRefining}
              onRefine={() => generatePrompt("refine")}
              onAdVersion={() => generatePrompt("ad")}
            />
          </div>
        ) : (
          <PromptHistory items={historyItems} onDelete={deleteItem} onClearAll={clearAll} />
        )}
      </div>
    </div>
  );
};

export default Index;
