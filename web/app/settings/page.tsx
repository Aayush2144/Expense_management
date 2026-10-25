"use client";

import React, { useState } from "react";
import { Settings, Tag, Plus, Trash2, Edit2, Server, RotateCcw, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useExpenseStore } from "@/lib/store";
import { api } from "@/lib/api";
import { getCategoryColor } from "@/lib/utils";

export default function SettingsPage() {
  const categories = useExpenseStore((s) => s.categories);
  const addCategory = useExpenseStore((s) => s.addCategory);
  const renameCategory = useExpenseStore((s) => s.renameCategory);
  const deleteCategory = useExpenseStore((s) => s.deleteCategory);
  const resetToDemoData = useExpenseStore((s) => s.resetToDemoData);

  const backendUrl = useExpenseStore((s) => s.backendUrl);
  const setBackendUrl = useExpenseStore((s) => s.setBackendUrl);

  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [renamedValue, setRenamedValue] = useState("");
  const [customUrl, setCustomUrl] = useState(backendUrl);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.error("Category already exists");
      return;
    }
    addCategory(trimmed);
    toast.success(`Category "${trimmed}" added!`);
    setNewCatName("");
  };

  const handleSaveRename = () => {
    if (!editingCat || !renamedValue.trim()) return;
    renameCategory(editingCat, renamedValue.trim());
    toast.success(`Renamed "${editingCat}" to "${renamedValue.trim()}"`);
    setEditingCat(null);
  };

  const handleTestBackend = async () => {
    setTestingConnection(true);
    setBackendUrl(customUrl);
    const ok = await api.healthCheck();
    setTestingConnection(false);

    if (ok) {
      toast.success("Successfully connected to backend API!", {
        description: customUrl,
      });
    } else {
      toast.error("Could not reach backend at specified URL", {
        description: "Verify that the backend is online and CORS is enabled.",
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-primary" /> Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Customize expense categories, connect live backend APIs, or reset local storage demo state.
        </p>
      </div>

      {/* Category Management Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" /> Manage Categories
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Add custom categories or rename/delete existing ones.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <Input
              placeholder="New category name (e.g. Travel, Gym)..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="text-xs h-9"
            />
            <Button type="submit" variant="glow" size="sm" className="h-9 gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </form>

          {/* Existing Categories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  />
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate">{cat}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingCat(cat);
                      setRenamedValue(cat);
                    }}
                    title="Rename category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  {categories.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        deleteCategory(cat);
                        toast.success(`Removed category "${cat}"`);
                      }}
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backend API Connection Adapter */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" /> Backend API Adapter
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Connect to your deployed FastAPI backend or use local storage offline persistence.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Backend Endpoint URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-api.onrender.com"
                className="text-xs h-9"
              />
              <Button
                onClick={handleTestBackend}
                disabled={testingConnection}
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1.5 text-xs"
              >
                {testingConnection ? "Pinging..." : "Test Link"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default: <code className="text-primary font-mono text-[11px]">https://expense-management-0ik6.onrender.com</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset State */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg text-destructive flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Reset Seed Data
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Clear all localStorage changes and restore original Streamlit demo transactions.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              resetToDemoData();
              toast.success("Reset data to original seed demo values!");
            }}
            className="text-xs h-9"
          >
            Reset to Factory Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      {editingCat && (
        <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
          <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Edit2 className="h-4 w-4 text-primary" /> Rename Category "{editingCat}"
              </DialogTitle>
            </DialogHeader>

            <div className="py-3 space-y-2">
              <label className="text-xs font-medium text-foreground">New Category Name</label>
              <Input
                value={renamedValue}
                onChange={(e) => setRenamedValue(e.target.value)}
                placeholder="Enter new name..."
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditingCat(null)}>
                Cancel
              </Button>
              <Button variant="glow" onClick={handleSaveRename}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
