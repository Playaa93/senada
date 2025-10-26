"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/features/data-table";
import type { RestockPrediction } from "@/types";

// TODO: Remplacer par des appels API
const mockPredictions: RestockPrediction[] = [];

const columns: ColumnDef<RestockPrediction>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "suggestedQty",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Qté Suggérée
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "predictedDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Prévue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("predictedDate") as Date;
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "confidence",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Confiance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const confidence = row.getValue("confidence") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-12">{confidence}%</div>
          <div className="h-2 w-20 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "PENDING"
              ? "default"
              : status === "ORDERED"
              ? "secondary"
              : "outline"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const prediction = row.original;

      if (prediction.status === "PENDING") {
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="default">
              Commander
            </Button>
            <Button size="sm" variant="outline">
              Ignorer
            </Button>
          </div>
        );
      }
      return null;
    },
  },
];

export default function RestockPage() {
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  const filteredPredictions =
    selectedStatus === "all"
      ? mockPredictions
      : mockPredictions.filter((p) => p.status === selectedStatus);

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    console.log("Export vers PDF");
  };

  const handleExportExcel = () => {
    // TODO: Implémenter l'export Excel
    console.log("Export vers Excel");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Prédictions Réappro</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exporter Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="ORDERED">Commandé</SelectItem>
            <SelectItem value="DISMISSED">Ignoré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredPredictions}
        searchKey="productName"
        searchPlaceholder="Rechercher des prédictions..."
      />
    </div>
  );
}
