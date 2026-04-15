import { Sparkles, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">Aura Studio AI Prompt Generator</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="text-muted-foreground hover:text-primary"
              title="Painel Admin"
            >
              <Shield className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
        Envie uma imagem de referência e gere prompts ultra-detalhados para recriar com IA
      </p>
    </header>
  );
};

export default Header;
