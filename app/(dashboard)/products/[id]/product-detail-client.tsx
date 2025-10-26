"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Package, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import Link from "next/link";
import { StockMovementDialog } from "@/components/features/stock-movement-dialog";

interface StockMovement {
  id: number;
  productId: number;
  type: "IN" | "OUT";
  quantity: number;
  reason: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  buyPrice: number;
  sellPrice: number;
  currentStock: number;
  minStock: number;
  supplierId: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  recentMovements: StockMovement[];
}

export function ProductDetailClient() {
  const router = useRouter();
  const params = useParams();
  const productId = params['id'] as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [stockInDialogOpen, setStockInDialogOpen] = useState(false);
  const [stockOutDialogOpen, setStockOutDialogOpen] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const result = await response.json();

      if (result.success && result.data?.data) {
        setProduct(result.data.data);
      } else {
        toast.error("Produit introuvable");
        router.push("/products");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement du produit");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isLowStock = product.currentStock <= product.minStock;
  const margin = product.sellPrice - product.buyPrice;
  const marginPercent = ((margin / product.buyPrice) * 100).toFixed(1);

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">SKU: {product.sku}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations du produit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            {product.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Prix d'achat</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(product.buyPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prix de vente</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(product.sellPrice)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Marge</p>
              <p className="text-lg font-semibold text-green-600">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(margin)}{" "}
                ({marginPercent}%)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Stock actuel</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">{product.currentStock}</p>
                {isLowStock && (
                  <Badge variant="destructive">Stock faible</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Stock minimum</p>
              <p className="text-xl">{product.minStock}</p>
            </div>

            <div className="pt-4 space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setStockInDialogOpen(true)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Enregistrer entrée
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setStockOutDialogOpen(true)}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Enregistrer sortie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des mouvements de stock
          </CardTitle>
          <CardDescription>
            {product.recentMovements.length === 0
              ? "Aucun mouvement enregistré"
              : `${product.recentMovements.length} derniers mouvements`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {product.recentMovements.length > 0 ? (
            <div className="space-y-2">
              {product.recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {movement.type === "IN" ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {movement.type === "in" ? "Entrée" : "Sortie"} de{" "}
                        {movement.quantity} unité(s)
                      </p>
                      {movement.reason && (
                        <p className="text-sm text-muted-foreground">
                          {movement.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(movement.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun mouvement de stock enregistré</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement Dialogs */}
      {product && (
        <>
          <StockMovementDialog
            productId={product.id}
            productName={product.name}
            currentStock={product.currentStock}
            type="IN"
            open={stockInDialogOpen}
            onOpenChange={setStockInDialogOpen}
            onSuccess={fetchProduct}
          />
          <StockMovementDialog
            productId={product.id}
            productName={product.name}
            currentStock={product.currentStock}
            type="OUT"
            open={stockOutDialogOpen}
            onOpenChange={setStockOutDialogOpen}
            onSuccess={fetchProduct}
          />
        </>
      )}
    </div>
  );
}
