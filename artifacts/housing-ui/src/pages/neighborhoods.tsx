import React, { useState, useMemo } from "react";
import { useListNeighborhoods } from "@workspace/api-client-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, MapPin, DollarSign, ShieldAlert, Users, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";

export default function NeighborhoodsPage() {
  const { data: neighborhoods, isLoading, isError } = useListNeighborhoods();
  const [search, setSearch] = useState("");
  const [maxRent, setMaxRent] = useState<number>(3000);

  const filteredNeighborhoods = useMemo(() => {
    if (!neighborhoods) return [];
    
    let filtered = neighborhoods.filter(n => 
      n.Avg_Monthly_Rent_USD <= maxRent &&
      (n.Neighborhood.toLowerCase().includes(search.toLowerCase()) || 
       n.Zip_Code.toString().includes(search))
    );

    // Sort by Best Value approximation (lower rent, lower crime)
    return filtered.sort((a, b) => {
      const scoreA = (a.Avg_Monthly_Rent_USD * 0.5) + (a.Crime_Rate_Per_10k * 100);
      const scoreB = (b.Avg_Monthly_Rent_USD * 0.5) + (b.Crime_Rate_Per_10k * 100);
      return scoreA - scoreB;
    });
  }, [neighborhoods, search, maxRent]);

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif tracking-tight">Chicago Neighborhoods</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Browse and filter through {neighborhoods?.length || 50} neighborhoods to find your next home. 
            Ranked by our "Best Value" metric combining affordability and safety.
          </p>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Search className="h-4 w-4 text-muted-foreground" />
                Search Neighborhood or ZIP
              </label>
              <Input 
                placeholder="e.g. Lincoln Park, 60614..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Max Monthly Rent
                </label>
                <span className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md text-sm">
                  ${maxRent.toLocaleString()}
                </span>
              </div>
              <Slider 
                defaultValue={[3000]} 
                max={5000} 
                min={500} 
                step={50}
                onValueChange={(val) => setMaxRent(val[0])}
                className="py-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/60">
        <div className="rounded-md border-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px] font-semibold">Neighborhood</TableHead>
                <TableHead className="font-semibold"><div className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5"/> Avg Rent</div></TableHead>
                <TableHead className="font-semibold"><div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5"/> Median Income</div></TableHead>
                <TableHead className="font-semibold"><div className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5"/> Crime Rate</div></TableHead>
                <TableHead className="font-semibold"><div className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5"/> Affordable Units</div></TableHead>
                <TableHead className="text-right font-semibold">Value Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-destructive">
                    Failed to load neighborhoods data. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredNeighborhoods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-8 w-8 mb-3 opacity-20" />
                      <p>No neighborhoods found matching your criteria.</p>
                      <p className="text-sm">Try increasing your max rent or changing your search.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNeighborhoods.map((n, i) => {
                  const isTopValue = i < 3 && n.Avg_Monthly_Rent_USD < 1500;
                  
                  return (
                    <TableRow key={`${n.Zip_Code}-${n.Neighborhood}`} className="group hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{n.Neighborhood}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {n.Zip_Code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">${n.Avg_Monthly_Rent_USD.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm">${n.Median_Household_Income_USD.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{n.Crime_Rate_Per_10k}</span>
                          <span className="text-xs text-muted-foreground">/10k</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{n.Affordable_Housing_Units_Available}</TableCell>
                      <TableCell className="text-right">
                        {isTopValue ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                            Best Value
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Standard
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
    </div>
  );
}
