"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface StockMovementDialogProps {
  productId: number;
  productName: string;
  currentStock: number;
  type: "IN" | "OUT";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function StockMovementDialog({
  productId,
  productName,
  currentStock,
  type,
  open,
  onOpenChange,
  onSuccess,
}: StockMovementDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEntry = type === "IN";
  const title = isEntry ? "Enregistrer une entrée de stock" : "Enregistrer une sortie de stock";
  const description = isEntry
    ? "Ajouter du stock au produit"
    : "Retirer du stock du produit";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const qty = parseInt(quantity, 10);

      if (isNaN(qty) || qty <= 0) {
        toast.error("Veuillez entrer une quantité valide");
        return;
      }

      if (!isEntry && qty > currentStock) {
        toast.error(`Stock insuffisant. Stock actuel : ${currentStock}`);
        return;
      }

      const response = await fetch(`/api/products/${productId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          quantity: qty,
          reason: reason.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'enregistrement");
      }

      toast.success(
        isEntry
          ? `Entrée de ${qty} unité(s) enregistrée`
          : `Sortie de ${qty} unité(s) enregistrée`
      );

      // Reset form
      setQuantity("");
      setReason("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Impossible d'enregistrer le mouvement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produit</Label>
              <Input id="product" value={productName} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStock">Stock actuel</Label>
              <Input
                id="currentStock"
                value={`${currentStock} unité(s)`}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantité {isEntry ? "à ajouter" : "à retirer"} *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isEntry
                    ? "Ex: Réception fournisseur, Retour client..."
                    : "Ex: Vente, Casse, Échantillon..."
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
