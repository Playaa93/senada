"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Euro,
  ShoppingCart,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
} from "lucide-react";

// Données de démonstration
const customersData = [
  {
    id: 1,
    name: "Marie Dubois",
    email: "marie.dubois@email.fr",
    phone: "+33 6 12 34 56 78",
    segment: "VIP",
    totalSpent: 12450,
    orders: 23,
    lastOrder: "2025-10-20",
    city: "Paris",
    notes: "Cliente fidèle, préfère les parfums floraux",
  },
  {
    id: 2,
    name: "Jean Martin",
    email: "jean.martin@email.fr",
    phone: "+33 6 23 45 67 89",
    segment: "Régulier",
    totalSpent: 3200,
    orders: 8,
    lastOrder: "2025-10-15",
    city: "Lyon",
    notes: "",
  },
  {
    id: 3,
    name: "Sophie Bernard",
    email: "sophie.b@email.fr",
    phone: "+33 6 34 56 78 90",
    segment: "VIP",
    totalSpent: 18900,
    orders: 31,
    lastOrder: "2025-10-22",
    city: "Marseille",
    notes: "Achète régulièrement pour offrir",
  },
  {
    id: 4,
    name: "Pierre Leroy",
    email: "p.leroy@email.fr",
    phone: "+33 6 45 67 89 01",
    segment: "Occasionnel",
    totalSpent: 890,
    orders: 2,
    lastOrder: "2025-09-05",
    city: "Nice",
    notes: "",
  },
  {
    id: 5,
    name: "Émilie Petit",
    email: "emilie.petit@email.fr",
    phone: "+33 6 56 78 90 12",
    segment: "Régulier",
    totalSpent: 5600,
    orders: 12,
    lastOrder: "2025-10-18",
    city: "Toulouse",
    notes: "Intéressée par les nouveautés",
  },
  {
    id: 6,
    name: "Thomas Moreau",
    email: "thomas.m@email.fr",
    phone: "+33 6 67 89 01 23",
    segment: "Occasionnel",
    totalSpent: 1250,
    orders: 3,
    lastOrder: "2025-08-12",
    city: "Bordeaux",
    notes: "",
  },
  {
    id: 7,
    name: "Caroline Roux",
    email: "caroline.roux@email.fr",
    phone: "+33 6 78 90 12 34",
    segment: "VIP",
    totalSpent: 15200,
    orders: 28,
    lastOrder: "2025-10-21",
    city: "Paris",
    notes: "Préfère les parfums orientaux",
  },
];

const recentOrders = [
  { date: "2025-10-22", customer: "Sophie Bernard", amount: 450, product: "Dior Sauvage" },
  { date: "2025-10-21", customer: "Caroline Roux", amount: 380, product: "Chanel No. 5" },
  { date: "2025-10-20", customer: "Marie Dubois", amount: 520, product: "YSL Black Opium" },
  { date: "2025-10-18", customer: "Émilie Petit", amount: 290, product: "Tom Ford Oud" },
  { date: "2025-10-15", customer: "Jean Martin", amount: 340, product: "Hermès Terre" },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const stats = {
    totalCustomers: customersData.length,
    totalRevenue: customersData.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrder: customersData.reduce((sum, c) => sum + c.totalSpent, 0) /
                  customersData.reduce((sum, c) => sum + c.orders, 0),
    activeCustomers: customersData.filter(c =>
      new Date(c.lastOrder) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "VIP":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400";
      case "Régulier":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      case "Occasionnel":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
      default:
        return "";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Gérez vos relations clients et suivez leurs achats
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un client</DialogTitle>
              <DialogDescription>
                Créez une fiche client pour suivre les achats et préférences
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Marie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Dubois" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="marie.dubois@email.fr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" placeholder="Paris" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Préférences, remarques..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Annuler</Button>
              <Button>Créer le client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCustomers} actifs ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              Tous les clients confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageOrder.toFixed(0)} €</div>
            <p className="text-xs text-muted-foreground">
              Par commande
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de rétention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Clients réguliers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des clients</TabsTrigger>
          <TabsTrigger value="segments">Segmentation</TabsTrigger>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Base clients</CardTitle>
                  <CardDescription>
                    {filteredCustomers.length} client(s) trouvé(s)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un client..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Régulier">Régulier</SelectItem>
                      <SelectItem value="Occasionnel">Occasionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>CA Total</TableHead>
                    <TableHead>Dernier achat</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.city}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSegmentColor(customer.segment)}>
                          {customer.segment === "VIP" && <Star className="mr-1 h-3 w-3" />}
                          {customer.segment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell className="font-medium">{customer.totalSpent.toLocaleString()} €</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(customer.lastOrder).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>Nouvelle commande</DropdownMenuItem>
                            <DropdownMenuItem>Envoyer un email</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  Clients VIP
                </CardTitle>
                <CardDescription>Haute valeur client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {customersData.filter(c => c.segment === "VIP").length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  CA moyen: {(customersData.filter(c => c.segment === "VIP")
                    .reduce((sum, c) => sum + c.totalSpent, 0) /
                    customersData.filter(c => c.segment === "VIP").length).toFixed(0)} €
                </p>
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Contribution au CA</div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{
                        width: `${(customersData.filter(c => c.segment === "VIP")
                          .reduce((sum, c) => sum + c.totalSpent, 0) / stats.totalRevenue * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((customersData.filter(c => c.segment === "VIP")
                      .reduce((sum, c) => sum + c.totalSpent, 0) / stats.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Clients Réguliers
                </CardTitle>
                <CardDescription>Achats fréquents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {customersData.filter(c => c.segment === "Régulier").length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  CA moyen: {(customersData.filter(c => c.segment === "Régulier")
                    .reduce((sum, c) => sum + c.totalSpent, 0) /
                    customersData.filter(c => c.segment === "Régulier").length).toFixed(0)} €
                </p>
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Contribution au CA</div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${(customersData.filter(c => c.segment === "Régulier")
                          .reduce((sum, c) => sum + c.totalSpent, 0) / stats.totalRevenue * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((customersData.filter(c => c.segment === "Régulier")
                      .reduce((sum, c) => sum + c.totalSpent, 0) / stats.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-gray-500" />
                  Clients Occasionnels
                </CardTitle>
                <CardDescription>Achats sporadiques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {customersData.filter(c => c.segment === "Occasionnel").length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  CA moyen: {(customersData.filter(c => c.segment === "Occasionnel")
                    .reduce((sum, c) => sum + c.totalSpent, 0) /
                    customersData.filter(c => c.segment === "Occasionnel").length).toFixed(0)} €
                </p>
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Contribution au CA</div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gray-500"
                      style={{
                        width: `${(customersData.filter(c => c.segment === "Occasionnel")
                          .reduce((sum, c) => sum + c.totalSpent, 0) / stats.totalRevenue * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((customersData.filter(c => c.segment === "Occasionnel")
                      .reduce((sum, c) => sum + c.totalSpent, 0) / stats.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Dernières commandes des clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {order.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.product}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.amount} €</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </div>
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
