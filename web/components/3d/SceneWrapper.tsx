"use client";

import dynamic from "next/dynamic";
import React from "react";

const LazyFloatingVault = dynamic(
  () => import("./FloatingVaultScene").then((m) => m.FloatingVaultScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 flex flex-col items-center justify-center space-y-3 bg-muted/10 rounded-2xl animate-pulse">
        <div className="w-16 h-16 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Initializing 3D Visual Experience...</span>
      </div>
    ),
  }
);

const LazyCategory3D = dynamic(
  () => import("./Category3DDonut").then((m) => m.Category3DDonut),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 flex flex-col items-center justify-center space-y-3 bg-muted/10 rounded-2xl animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Rendering 3D Charts...</span>
      </div>
    ),
  }
);

export const Vault3DHero = () => <LazyFloatingVault />;
export const Category3DChart = ({ data }: { data: any }) => <LazyCategory3D data={data} />;
