import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import StyleSelector, { type PromptStyle } from "@/components/StyleSelector";
import PromptOutput from "@/components/PromptOutput";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState<PromptStyle>("realistic");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

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
        body: { imageBase64: imagePreview, style, mode },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setPrompt(data.prompt);
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

        <div className="space-y-8">
          {/* Upload */}
          <section className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Imagem de Referência
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              preview={imagePreview}
              onClear={handleClear}
            />
          </section>

          {/* Style */}
          <section className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Estilo do Prompt
            </label>
            <StyleSelector selected={style} onChange={setStyle} />
          </section>

          {/* Generate */}
          <Button
            onClick={() => generatePrompt("generate")}
            disabled={!imagePreview || isLoading}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold text-base py-6"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Gerar Prompt
          </Button>

          {/* Output */}
          <PromptOutput
            prompt={prompt}
            isLoading={isLoading}
            isRefining={isRefining}
            onRefine={() => generatePrompt("refine")}
            onAdVersion={() => generatePrompt("ad")}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
