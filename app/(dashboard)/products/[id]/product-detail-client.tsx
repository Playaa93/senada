"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// TODO: Fetch product data from API using the ID from URL params
const mockProduct = {
  id: "0",
  sku: "",
  name: "Produit non trouvé",
  category: "",
  stock: 0,
  minStock: 0,
  price: 0,
  description: "Chargement...",
  supplierId: "",
};

const stockHistory: { date: string; stock: number }[] = [];

export function ProductDetailClient() {
  const [movementType, setMovementType] = React.useState<string>("IN");
  const [quantity, setQuantity] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  const handleStockMovement = () => {
    // TODO: Implement API call to record stock movement
    console.log({ movementType, quantity, reason });
    setQuantity("");
    setReason("");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{mockProduct.name}</h2>
          <p className="text-muted-foreground">{mockProduct.sku}</p>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Product
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Details about this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">SKU</Label>
                <p className="font-medium">{mockProduct.sku}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="font-medium">
                  <Badge variant="outline">{mockProduct.category}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Stock</Label>
                <p className="font-medium text-2xl">{mockProduct.stock}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Minimum Stock</Label>
                <p className="font-medium text-2xl">{mockProduct.minStock}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Price</Label>
                <p className="font-medium text-2xl">
                  ${mockProduct.price.toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Value</Label>
                <p className="font-medium text-2xl">
                  ${(mockProduct.stock * mockProduct.price).toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{mockProduct.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Movement Form */}
        <Card>
          <CardHeader>
            <CardTitle>Record Stock Movement</CardTitle>
            <CardDescription>Add or remove stock for this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="movement-type">Movement Type</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger id="movement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Stock In</SelectItem>
                  <SelectItem value="OUT">Stock Out</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for stock movement"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button onClick={handleStockMovement} className="w-full">
              Record Movement
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stock History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Stock History
          </CardTitle>
          <CardDescription>Stock levels over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
