"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FragranceSearch } from "@/components/features/fragrance-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Fragrance } from "@/lib/api/fragrances";

// Fonction pour générer un SKU automatiquement
function generateSKU(brand: string, name: string): string {
  if (!brand && !name) return "";

  // Nettoyer et formater
  const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
  const timestamp = Date.now().toString().slice(-4);

  return `${cleanBrand || "PROD"}-${cleanName || "ITEM"}-${timestamp}`;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Formulaire de base
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sku, setSku] = useState("");

  // Données optionnelles du parfum
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null);
  const [gender, setGender] = useState("");
  const [perfumer, setPerfumer] = useState("");
  const [notes, setNotes] = useState<{ top?: string[]; middle?: string[]; base?: string[] }>({});

  // Générer automatiquement le SKU quand le nom ou la marque change
  useEffect(() => {
    if (name || brand) {
      setSku(generateSKU(brand, name));
    }
  }, [name, brand]);

  const handleFragranceSelect = (fragrance: Fragrance) => {
    setSelectedFragrance(fragrance);

    // Pré-remplir le formulaire automatiquement
    setName(fragrance.name);
    setBrand(fragrance.brand);
    setDescription(fragrance.description || "");
    setGender(fragrance.gender || "");

    // Si pas de parfumeur spécifique, utiliser la marque
    setPerfumer(fragrance.perfumer || fragrance.brand);

    // Stocker les notes pour affichage
    if (fragrance.notes) {
      setNotes(fragrance.notes);
    }
  };

  const clearFragrance = () => {
    setSelectedFragrance(null);
    setName("");
    setBrand("");
    setDescription("");
    setGender("");
    setPerfumer("");
    setNotes({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name,
        brand,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        sku,
        // Données additionnelles du parfum
        gender,
        perfumer,
        topNotes: notes.top?.join(", "),
        middleNotes: notes.middle?.join(", "),
        baseNotes: notes.base?.join(", "),
        fragranceId: selectedFragrance?.id,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout du produit");

      router.push("/products");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Impossible d'ajouter le produit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un nouveau produit</CardTitle>
          <CardDescription>
            Recherchez un parfum dans notre base de données de 69,423 parfums ou créez un nouveau produit manuellement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Recherche de Parfum */}
            <div className="space-y-4">
              <div>
                <Label>Rechercher dans la base de données</Label>
                <div className="mt-2">
                  <FragranceSearch onSelect={handleFragranceSelect} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Recherchez parmi 69,423 parfums (Chanel, Dior, Gucci, etc.)
                </p>
              </div>

              {/* Parfum sélectionné */}
              {selectedFragrance && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {selectedFragrance.imageUrl && (
                          <img
                            src={selectedFragrance.imageUrl}
                            alt={selectedFragrance.name}
                            className="h-24 w-18 object-cover rounded"
                          />
                        )}
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedFragrance.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedFragrance.brand}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {selectedFragrance.gender && (
                              <Badge variant="outline">{selectedFragrance.gender}</Badge>
                            )}
                            {selectedFragrance.perfumer && (
                              <Badge variant="secondary">{selectedFragrance.perfumer}</Badge>
                            )}
                            {selectedFragrance.rating && (
                              <Badge variant="default">
                                {selectedFragrance.rating.toFixed(1)} ⭐
                              </Badge>
                            )}
                          </div>
                          {selectedFragrance.notes && (
                            <div className="text-sm space-y-1">
                              {selectedFragrance.notes.top && selectedFragrance.notes.top.length > 0 && (
                                <p>
                                  <span className="font-medium">Notes de tête:</span>{" "}
                                  {selectedFragrance.notes.top.slice(0, 5).join(", ")}
                                </p>
                              )}
                              {selectedFragrance.notes.middle && selectedFragrance.notes.middle.length > 0 && (
                                <p>
                                  <span className="font-medium">Notes de cœur:</span>{" "}
                                  {selectedFragrance.notes.middle.slice(0, 5).join(", ")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearFragrance}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Informations du produit</h3>
              <div className="grid gap-4">
                {/* Nom du produit */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Chanel No. 5"
                    required
                  />
                </div>

                {/* Marque */}
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Chanel"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du produit..."
                    rows={4}
                  />
                </div>

                {/* Prix et Quantité */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="99.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="10"
                      required
                    />
                  </div>
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (généré automatiquement)</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Sera généré automatiquement"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le SKU est généré à partir de la marque et du nom. Vous pouvez le modifier si nécessaire.
                  </p>
                </div>

                {/* Informations optionnelles du parfum */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Informations complémentaires {selectedFragrance && "(automatiquement remplies)"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Genre</Label>
                      <Input
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        placeholder="Ex: for women, for men"
                        readOnly={!!selectedFragrance}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perfumer">Parfumeur</Label>
                      <Input
                        id="perfumer"
                        value={perfumer}
                        onChange={(e) => setPerfumer(e.target.value)}
                        placeholder="Ex: Francis Kurkdjian"
                        readOnly={!!selectedFragrance}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Ajout en cours..." : "Ajouter le produit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
