import { Sparkles } from "lucide-react";

const Header = () => (
  <header className="text-center space-y-4 py-8">
    <div className="flex items-center justify-center gap-3">
      <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold">
        <span className="gradient-text">PromptVision</span>
      </h1>
    </div>
    <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
      Envie uma imagem de referência e gere prompts ultra-detalhados para recriar com IA
    </p>
  </header>
);

export default Header;
