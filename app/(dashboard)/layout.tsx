import type { Metadata } from 'next';
import { Navigation } from "@/components/features/navigation";
import { Header } from "@/components/features/header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: 'Tableau de bord',
  description: 'Gérez votre inventaire de parfums et vos analyses',
};

/**
 * Layout Tableau de bord
 *
 * Ce layout enveloppe toutes les pages du tableau de bord et fournit :
 * - Structure de navigation cohérente
 * - Composants partagés sidebar/header
 * - Contexte d'authentification (à implémenter)
 *
 * Le dossier (dashboard) est un groupe de routes qui n'est pas ajouté au chemin URL.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Barre latérale */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <Navigation />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
