"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Shield, Store, Database, Download } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres de votre application
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informations de la boutique
              </CardTitle>
              <CardDescription>
                Configurez les informations de base de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shop-name">Nom de la boutique</Label>
                  <Input id="shop-name" defaultValue="Senada Stock" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contact@senada.fr" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="usd">Dollar ($)</SelectItem>
                      <SelectItem value="gbp">Livre (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue="123 Rue du Commerce, 75001 Paris" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select defaultValue="europe-paris">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe-paris">Europe/Paris (GMT+1)</SelectItem>
                    <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                    <SelectItem value="america-new-york">America/New York (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Annuler</Button>
                <Button>Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez être informé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes de stock faible</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir une notification quand un produit atteint son seuil minimum
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels de commande</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les commandes recommandées par le système
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapports hebdomadaires</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un résumé des performances chaque semaine
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer les notifications importantes par email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notification-email">Email de notification</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="notification-email"
                    type="email"
                    defaultValue="notifications@senada.fr"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Annuler</Button>
                <Button>Enregistrer les préférences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Paramètres d'inventaire
              </CardTitle>
              <CardDescription>
                Configurez les règles de gestion de stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min-stock-percent">Seuil de stock minimum (%)</Label>
                  <Input
                    id="min-stock-percent"
                    type="number"
                    defaultValue="20"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pourcentage du stock optimal considéré comme minimum
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder-point">Point de commande (jours)</Label>
                  <Input
                    id="reorder-point"
                    type="number"
                    defaultValue="7"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre de jours de stock avant déclenchement de commande
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lead-time">Délai de livraison moyen (jours)</Label>
                  <Input
                    id="lead-time"
                    type="number"
                    defaultValue="3"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safety-stock">Stock de sécurité (jours)</Label>
                  <Input
                    id="safety-stock"
                    type="number"
                    defaultValue="5"
                    min="0"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prédictions automatiques</Label>
                  <p className="text-sm text-muted-foreground">
                    Utiliser l'IA pour prédire les besoins de réapprovisionnement
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Commandes automatiques</Label>
                  <p className="text-sm text-muted-foreground">
                    Créer automatiquement des bons de commande suggérés
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="inventory-method">Méthode de valorisation</Label>
                <Select defaultValue="fifo">
                  <SelectTrigger id="inventory-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">FIFO (Premier entré, premier sorti)</SelectItem>
                    <SelectItem value="lifo">LIFO (Dernier entré, premier sorti)</SelectItem>
                    <SelectItem value="average">Coût moyen pondéré</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Annuler</Button>
                <Button>Enregistrer les paramètres</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité et confidentialité
              </CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajouter une couche de sécurité supplémentaire
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sessions actives</Label>
                  <p className="text-sm text-muted-foreground">
                    Voir et gérer les appareils connectés
                  </p>
                </div>
                <Button variant="outline">Gérer</Button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Annuler</Button>
                <Button>Mettre à jour le mot de passe</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Gestion des données
              </CardTitle>
              <CardDescription>
                Exportez, importez ou supprimez vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exporter les données</Label>
                <p className="text-sm text-muted-foreground">
                  Téléchargez une copie de toutes vos données
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline">Exporter en CSV</Button>
                  <Button variant="outline">Exporter en JSON</Button>
                  <Button variant="outline">Exporter en Excel</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Importer des données</Label>
                <p className="text-sm text-muted-foreground">
                  Importez des produits ou des fournisseurs depuis un fichier
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline">Importer produits</Button>
                  <Button variant="outline">Importer fournisseurs</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Sauvegarde automatique</Label>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      Sauvegarder automatiquement vos données chaque semaine
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-destructive">Zone de danger</Label>
                <p className="text-sm text-muted-foreground">
                  Actions irréversibles sur vos données
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="destructive" size="sm">
                    Réinitialiser les données
                  </Button>
                  <Button variant="destructive" size="sm">
                    Supprimer le compte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
