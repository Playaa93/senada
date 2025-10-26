"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/features/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockMovementDialog } from "@/components/features/stock-movement-dialog";

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
}

// Fonction de suppression
const deleteProduct = async (id: number, onSuccess: () => void) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
    return;
  }

  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur lors de la suppression");
    }

    toast.success("Produit supprimé avec succès");
    onSuccess(); // Recharger les produits
  } catch (error: any) {
    console.error("Erreur:", error);
    toast.error(error.message || "Impossible de supprimer le produit");
  }
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "sku",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SKU
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("category")}</Badge>;
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const minStock = row.original.minStock;
      const isLowStock = stock <= minStock;
      return (
        <Badge variant={isLowStock ? "destructive" : "default"}>
          {stock} {isLowStock && "⚠"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "minStock",
    header: "Stock Min",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prix
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/products/${product.id}`}>Voir les détails</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Modifier le produit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Enregistrer entrée</DropdownMenuItem>
            <DropdownMenuItem>Enregistrer sortie</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Supprimer le produit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [stockInDialogOpen, setStockInDialogOpen] = React.useState(false);
  const [stockOutDialogOpen, setStockOutDialogOpen] = React.useState(false);

  // Récupérer les produits depuis l'API
  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const result = await response.json();

      if (result.success && result.data?.data) {
        // Transformer les données pour correspondre à l'interface Product
        const transformedProducts = result.data.data.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          stock: p.currentStock,
          minStock: p.minStock,
          price: p.sellPrice,
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Définir les colonnes avec accès aux fonctions du composant
  const columnsWithActions: ColumnDef<Product>[] = React.useMemo(
    () => [
      ...columns.filter((col) => col.id !== "actions"),
      {
        id: "actions",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/products/${product.id}`)}>
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/products/${product.id}/edit`)}>
                  Modifier le produit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProduct(product);
                    setStockInDialogOpen(true);
                  }}
                >
                  Enregistrer entrée
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProduct(product);
                    setStockOutDialogOpen(true);
                  }}
                >
                  Enregistrer sortie
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteProduct(product.id, fetchProducts)}
                >
                  Supprimer le produit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [fetchProducts, router, setSelectedProduct, setStockInDialogOpen, setStockOutDialogOpen]
  );

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Produits</h2>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="Parfum Femme">Parfum Femme</SelectItem>
            <SelectItem value="Parfum Homme">Parfum Homme</SelectItem>
            <SelectItem value="Unisex">Unisexe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columnsWithActions}
        data={filteredProducts}
        searchKey="name"
        searchPlaceholder="Rechercher par nom ou SKU..."
      />

      {/* Stock Movement Dialogs */}
      {selectedProduct && (
        <>
          <StockMovementDialog
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            currentStock={selectedProduct.stock}
            type="IN"
            open={stockInDialogOpen}
            onOpenChange={setStockInDialogOpen}
            onSuccess={fetchProducts}
          />
          <StockMovementDialog
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            currentStock={selectedProduct.stock}
            type="OUT"
            open={stockOutDialogOpen}
            onOpenChange={setStockOutDialogOpen}
            onSuccess={fetchProducts}
          />
        </>
      )}
    </div>
  );
}
