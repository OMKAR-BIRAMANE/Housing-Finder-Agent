import React from "react";
import { Link, useLocation } from "wouter";
import { Building, Map, MessageSquare } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-5xl h-16 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
              <Building className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight">Chicago Housing</span>
              <span className="text-xs text-muted-foreground font-medium leading-none">Affordable Finder</span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-1">
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Link>
            <Link 
              href="/neighborhoods" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/neighborhoods" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Neighborhoods</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}
