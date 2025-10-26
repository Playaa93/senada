"use client";

import { StatsCard } from "@/components/features/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Package, AlertTriangle, TrendingUp, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

// Données de test - à remplacer par des appels API
const stats = {
  totalProducts: 248,
  totalValue: 125340,
  lowStockAlerts: 12,
  revenueThisMonth: 45230,
};

const recentMovements = [
  {
    id: "1",
    product: "Chanel No. 5 EDP 100ml",
    type: "SORTIE",
    quantity: 5,
    date: "2025-10-25",
    reason: "Vente",
  },
  {
    id: "2",
    product: "Dior Sauvage EDT 60ml",
    type: "ENTRÉE",
    quantity: 20,
    date: "2025-10-24",
    reason: "Réapprovisionnement",
  },
  {
    id: "3",
    product: "Tom Ford Black Orchid 50ml",
    type: "SORTIE",
    quantity: 3,
    date: "2025-10-24",
    reason: "Vente",
  },
  {
    id: "4",
    product: "YSL La Nuit de L'Homme 100ml",
    type: "AJUSTEMENT",
    quantity: -2,
    date: "2025-10-23",
    reason: "Endommagé",
  },
];

const lowStockProducts = [
  { id: "1", name: "Chanel No. 5 EDP 100ml", sku: "CHN-005-100", stock: 3, minStock: 10 },
  { id: "2", name: "Hermès Terre d'Hermès 75ml", sku: "HER-TER-075", stock: 5, minStock: 12 },
  { id: "3", name: "Gucci Bloom EDP 50ml", sku: "GUC-BLM-050", stock: 2, minStock: 8 },
  { id: "4", name: "Prada L'Homme EDT 100ml", sku: "PRA-LHM-100", stock: 4, minStock: 10 },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Produits"
          value={stats.totalProducts}
          description="Articles en stock"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Valeur Totale"
          value={`${stats.totalValue.toLocaleString()} €`}
          description="Valeur du stock"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Alertes Stock Bas"
          value={stats.lowStockAlerts}
          description="Produits sous minimum"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Revenus du Mois"
          value={`${stats.revenueThisMonth.toLocaleString()} €`}
          description="Chiffre d'affaires"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Stock Movements */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mouvements Récents</CardTitle>
            <CardDescription>Derniers changements de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Raison</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">{movement.product}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          movement.type === "ENTRÉE"
                            ? "default"
                            : movement.type === "SORTIE"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {movement.type === "ENTRÉE" && <ArrowDownRight className="mr-1 h-3 w-3" />}
                        {movement.type === "SORTIE" && <ArrowUpRight className="mr-1 h-3 w-3" />}
                        {movement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.date}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Alertes Stock Bas</CardTitle>
            <CardDescription>Produits à réapprovisionner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {product.stock}/{product.minStock}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/restock">Voir toutes les prédictions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Tâches courantes et raccourcis</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/products/new">
              <Plus className="h-8 w-8" />
              Ajouter un Produit
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/products">
              <ArrowUpRight className="h-8 w-8" />
              Mouvement de Stock
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/reports">
              <TrendingUp className="h-8 w-8" />
              Voir les Rapports
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
