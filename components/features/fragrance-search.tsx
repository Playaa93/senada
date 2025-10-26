"use client";

import * as React from "react";
import { Search, Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { searchFragrances, type Fragrance } from "@/lib/api/fragrances";
import { Badge } from "@/components/ui/badge";

interface FragranceSearchProps {
  onSelect: (fragrance: Fragrance) => void;
}

export function FragranceSearch({ onSelect }: FragranceSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [fragrances, setFragrances] = React.useState<Fragrance[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    if (query.length < 2) {
      setFragrances([]);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchFragrances(query, 10);
        setFragrances(result.fragrances);
      } catch (error) {
        console.error("Search error:", error);
        setFragrances([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelect = (fragrance: Fragrance) => {
    onSelect(fragrance);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          Rechercher un parfum dans la base de données...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Ex: Chanel No. 5, Dior Sauvage..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {!loading && query.length >= 2 && fragrances.length === 0 && (
              <CommandEmpty>Aucun parfum trouvé. Essayez un autre terme.</CommandEmpty>
            )}
            {!loading && fragrances.length > 0 && (
              <CommandGroup heading={`${fragrances.length} résultat(s)`}>
                {fragrances.map((fragrance) => (
                  <CommandItem
                    key={fragrance.id}
                    onSelect={() => handleSelect(fragrance)}
                    className="flex items-start gap-3 p-3 cursor-pointer"
                  >
                    {fragrance.imageUrl && (
                      <img
                        src={fragrance.imageUrl}
                        alt={fragrance.name}
                        className="h-16 w-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{fragrance.name}</p>
                      <p className="text-sm text-muted-foreground">{fragrance.brand}</p>
                      {fragrance.gender && (
                        <Badge variant="outline" className="text-xs">
                          {fragrance.gender}
                        </Badge>
                      )}
                      {fragrance.notes && (
                        <div className="text-xs text-muted-foreground">
                          {fragrance.notes.top && fragrance.notes.top.length > 0 && (
                            <span>Notes: {fragrance.notes.top.slice(0, 3).join(", ")}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {fragrance.rating && (
                      <div className="text-sm font-medium">{fragrance.rating.toFixed(1)} ⭐</div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
