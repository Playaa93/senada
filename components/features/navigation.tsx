"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Settings,
  BarChart3,
  UserCircle2,
} from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Produits", href: "/products", icon: Package },
  { name: "Clients", href: "/customers", icon: UserCircle2 },
  { name: "Fournisseurs", href: "/suppliers", icon: Users },
  { name: "Prédictions Réappro", href: "/restock", icon: TrendingUp },
  { name: "Rapports", href: "/reports", icon: BarChart3 },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-6">
        <h2 className="px-4 text-lg font-semibold tracking-tight">
          Senada Stock
        </h2>
      </div>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
