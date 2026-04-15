import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft, Users, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  approved: boolean;
  created_at: string;
}

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar usuários");
    } else {
      setProfiles(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProfiles();
  }, [isAdmin]);

  const toggleApproval = async (profile: Profile) => {
    setUpdating(profile.id);
    const { error } = await supabase
      .from("profiles")
      .update({ approved: !profile.approved })
      .eq("id", profile.id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(
        profile.approved ? "Acesso revogado" : "Usuário aprovado!"
      );
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, approved: !p.approved } : p
        )
      );
    }
    setUpdating(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Acesso negado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Usuários ({profiles.length})
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : profiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum usuário cadastrado
            </p>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {p.display_name || p.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{p.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.approved
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {p.approved ? "Aprovado" : "Pendente"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updating === p.id}
                      onClick={() => toggleApproval(p)}
                      className={
                        p.approved
                          ? "text-destructive hover:text-destructive"
                          : "text-primary hover:text-primary"
                      }
                    >
                      {updating === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : p.approved ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
