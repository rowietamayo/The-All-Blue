import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import { Link } from "wouter";

import notFoundAnim from "../lottie/404.json";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-background animate-in fade-in duration-700">
      {/* Lottie animation */}
      <div className="w-64 h-64 mb-6">
        <Lottie animationData={notFoundAnim} loop={true} className="w-full h-full" />
      </div>

      {/* Text */}
      <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-3">404</h1>
      <p className="text-xl text-muted-foreground mb-2">Lost at Sea</p>
      <p className="text-sm text-muted-foreground/70 max-w-md text-center mb-8">
        This page has drifted beyond the Grand Line. Even the best navigators can't find it.
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 shadow-lg transition-transform hover:scale-105"
          >
            Return to Shore
          </Button>
        </Link>
        <Link href="/menu">
          <Button
            size="lg"
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground rounded-full px-8 shadow-lg transition-transform hover:scale-105"
          >
            Explore the Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}