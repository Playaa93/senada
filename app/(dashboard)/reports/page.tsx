"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Package, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Données pour le graphique des ventes mensuelles
const salesData = [
  { mois: "Mai", ventes: 28500, objectif: 25000 },
  { mois: "Juin", ventes: 32000, objectif: 30000 },
  { mois: "Juil", ventes: 29800, objectif: 28000 },
  { mois: "Août", ventes: 35200, objectif: 32000 },
  { mois: "Sept", ventes: 38900, objectif: 35000 },
  { mois: "Oct", ventes: 45230, objectif: 38000 },
];

// Données pour les produits les plus vendus
const topProductsData = [
  { name: "Chanel No. 5", ventes: 45 },
  { name: "Dior Sauvage", ventes: 38 },
  { name: "YSL Black Opium", ventes: 32 },
  { name: "Tom Ford Oud", ventes: 28 },
  { name: "Hermès Terre", ventes: 25 },
];

// Données détaillées pour l'onglet Ventes
const salesByCategory = [
  { categorie: "Parfum Femme", ventes: 45230, pourcentage: 42 },
  { categorie: "Parfum Homme", ventes: 38900, pourcentage: 36 },
  { categorie: "Unisexe", ventes: 23650, pourcentage: 22 },
];

const dailySalesData = [
  { jour: "Lun", ventes: 1250, objectif: 1500 },
  { jour: "Mar", ventes: 1820, objectif: 1500 },
  { jour: "Mer", ventes: 1680, objectif: 1500 },
  { jour: "Jeu", ventes: 2100, objectif: 1500 },
  { jour: "Ven", ventes: 2450, objectif: 1500 },
  { jour: "Sam", ventes: 3200, objectif: 2000 },
  { jour: "Dim", ventes: 2800, objectif: 2000 },
];

const paymentMethodData = [
  { methode: "Carte bancaire", valeur: 65, montant: 65000 },
  { methode: "Espèces", valeur: 25, montant: 25000 },
  { methode: "Virement", valeur: 10, montant: 10000 },
];

// Données pour l'onglet Inventaire
const stockLevelsByCategory = [
  { categorie: "Parfum Femme", stock: 245, minimum: 150, optimal: 300 },
  { categorie: "Parfum Homme", stock: 189, minimum: 120, optimal: 250 },
  { categorie: "Unisexe", stock: 98, minimum: 80, optimal: 150 },
];

const lowStockProducts = [
  { produit: "Byredo Gypsy Water", stock: 5, minimum: 8, commande: 15 },
  { produit: "Le Labo Santal 33", stock: 7, minimum: 10, commande: 20 },
  { produit: "Maison Margiela Replica", stock: 6, minimum: 10, commande: 15 },
  { produit: "Diptyque Baies", stock: 4, minimum: 8, commande: 12 },
];

const stockRotationData = [
  { mois: "Mai", entrees: 120, sorties: 95, stock: 445 },
  { mois: "Juin", entrees: 145, sorties: 128, stock: 462 },
  { mois: "Juil", entrees: 98, sorties: 115, stock: 445 },
  { mois: "Août", entrees: 165, sorties: 142, stock: 468 },
  { mois: "Sept", entrees: 128, sorties: 138, stock: 458 },
  { mois: "Oct", entrees: 185, sorties: 156, stock: 487 },
];

// Données pour l'onglet Fournisseurs
const supplierPerformance = [
  { fournisseur: "Parfums International", commandes: 45, livrees: 43, taux: 95.6, delai: 3.2 },
  { fournisseur: "Luxe Distribution", commandes: 38, livrees: 38, taux: 100, delai: 2.8 },
  { fournisseur: "Fragrance Premium", commandes: 32, livrees: 30, taux: 93.8, delai: 4.1 },
];

const deliveryTimesData = [
  { semaine: "S40", moyen: 3.2, objectif: 3.5 },
  { semaine: "S41", moyen: 2.8, objectif: 3.5 },
  { semaine: "S42", moyen: 3.5, objectif: 3.5 },
  { semaine: "S43", moyen: 2.9, objectif: 3.5 },
  { semaine: "S44", moyen: 3.1, objectif: 3.5 },
];

const supplierCostData = [
  { name: "Parfums International", value: 45 },
  { name: "Luxe Distribution", value: 35 },
  { name: "Fragrance Premium", value: 20 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rapports</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125 340 €</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes du mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+342</div>
                <p className="text-xs text-muted-foreground">
                  +18% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">248</div>
                <p className="text-xs text-muted-foreground">
                  +12 nouveaux ce mois-ci
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de rotation</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Évolution des ventes</CardTitle>
                <CardDescription>
                  Ventes mensuelles sur les 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="mois"
                      className="text-sm"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis
                      className="text-sm"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ventes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Ventes (€)"
                    />
                    <Line
                      type="monotone"
                      dataKey="objectif"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Objectif (€)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Produits les plus vendus</CardTitle>
                <CardDescription>Top 5 ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar
                      dataKey="ventes"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      name="Unités vendues"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">107 780 €</div>
                <p className="text-xs text-muted-foreground">
                  Sur 6 mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne journalière</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 043 €</div>
                <p className="text-xs text-muted-foreground">
                  Cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Croissance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+58.7%</div>
                <p className="text-xs text-muted-foreground">
                  Vs 6 mois précédents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">315 €</div>
                <p className="text-xs text-muted-foreground">
                  Par transaction
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventes par jour de la semaine</CardTitle>
                <CardDescription>
                  Comparaison objectifs vs réalisé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="jour"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="ventes" fill="hsl(var(--primary))" name="Ventes (€)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="objectif" fill="hsl(var(--muted-foreground))" name="Objectif (€)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
                <CardDescription>
                  Distribution des ventes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categorie, pourcentage }) => `${categorie}: ${pourcentage}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="ventes"
                    >
                      {salesByCategory.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement</CardTitle>
              <CardDescription>
                Répartition des moyens de paiement utilisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethodData.map((method, index) => (
                  <div key={method.methode} className="flex items-center">
                    <div className="w-[150px] text-sm font-medium">{method.methode}</div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${method.valeur}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-[100px] text-right text-sm font-medium">{method.valeur}%</div>
                    <div className="w-[120px] text-right text-sm text-muted-foreground">{method.montant.toLocaleString()} €</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Niveaux de stock par catégorie</CardTitle>
                <CardDescription>
                  Comparaison stock actuel vs minimum et optimal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockLevelsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="categorie"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      className="text-xs"
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="stock" fill="hsl(var(--primary))" name="Stock actuel" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="minimum" fill="hsl(var(--destructive))" name="Minimum" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="optimal" fill="hsl(var(--chart-2))" name="Optimal" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution du stock</CardTitle>
                <CardDescription>
                  Entrées, sorties et niveau de stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stockRotationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="mois"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="stock" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Stock total" />
                    <Area type="monotone" dataKey="entrees" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Entrées" />
                    <Area type="monotone" dataKey="sorties" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="Sorties" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produits en rupture ou stock faible</CardTitle>
              <CardDescription>
                Produits nécessitant un réapprovisionnement urgent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm">
                  <div>Produit</div>
                  <div className="text-center">Stock actuel</div>
                  <div className="text-center">Stock minimum</div>
                  <div className="text-center">À commander</div>
                </div>
                {lowStockProducts.map((product) => (
                  <div key={product.produit} className="grid grid-cols-4 gap-4 items-center">
                    <div className="font-medium">{product.produit}</div>
                    <div className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.stock < product.minimum ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                      }`}>
                        {product.stock} unités
                      </span>
                    </div>
                    <div className="text-center text-muted-foreground">{product.minimum} unités</div>
                    <div className="text-center">
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                        {product.commande} unités
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Délais de livraison moyens</CardTitle>
                <CardDescription>
                  Évolution des délais par semaine (en jours)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={deliveryTimesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="semaine"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="moyen"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Délai moyen (jours)"
                    />
                    <Line
                      type="monotone"
                      dataKey="objectif"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Objectif (jours)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des achats</CardTitle>
                <CardDescription>
                  Part de chaque fournisseur dans les achats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={supplierCostData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {supplierCostData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance des fournisseurs</CardTitle>
              <CardDescription>
                Taux de livraison et délais moyens par fournisseur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 pb-2 border-b font-medium text-sm">
                  <div>Fournisseur</div>
                  <div className="text-center">Commandes</div>
                  <div className="text-center">Livrées</div>
                  <div className="text-center">Taux</div>
                  <div className="text-center">Délai moyen</div>
                </div>
                {supplierPerformance.map((supplier) => (
                  <div key={supplier.fournisseur} className="grid grid-cols-5 gap-4 items-center">
                    <div className="font-medium">{supplier.fournisseur}</div>
                    <div className="text-center text-muted-foreground">{supplier.commandes}</div>
                    <div className="text-center text-muted-foreground">{supplier.livrees}</div>
                    <div className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        supplier.taux === 100
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : supplier.taux > 95
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {supplier.taux}%
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        supplier.delai <= 3
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : supplier.delai <= 3.5
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {supplier.delai} jours
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
