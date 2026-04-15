import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";

const PendingApproval = () => {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center glow-primary">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Aguardando Aprovação</h2>
          <p className="text-muted-foreground">
            Sua conta <span className="text-foreground font-medium">{profile?.email}</span> foi criada com sucesso.
            Um administrador precisa aprovar seu acesso antes que você possa usar o sistema.
          </p>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default PendingApproval;
