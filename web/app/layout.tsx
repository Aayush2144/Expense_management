"use client";

import React, { useState } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { AddExpenseModal } from "@/components/dashboard/AddExpenseModal";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>ExpenseVault 3D — Spatial Financial Dashboard</title>
        <meta
          name="description"
          content="Premium 3D-feeling expense tracking system with interactive spatial visualizations, category analytics, and full Streamlit parity."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans spatial-mesh-bg overflow-x-hidden">
        <div className="flex min-h-screen">
          {/* Collapsible Navigation Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Topbar */}
            <Topbar onOpenAddModal={() => setAddModalOpen(true)} />

            {/* View Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>

        {/* Global Add Expense Modal */}
        <AddExpenseModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
        />

        {/* Sonner Toast Notifications */}
        <Toaster
          position="bottom-right"
          theme="system"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "1rem",
              backdropFilter: "blur(16px)",
            },
          }}
        />
      </body>
    </html>
  );
}
