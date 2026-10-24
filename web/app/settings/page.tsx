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
        description: "Verify your server is live and CORS is enabled.",
      });
    }
  };

  const handleReset = () => {
    if (confirm("Reset all expenses and categories back to sample demo data?")) {
      resetToDemoData();
      toast.success("Demo dataset restored!");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" /> Application Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize spending categories, connect remote backend APIs, or reset state.
        </p>
      </div>

      {/* Backend API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" /> Remote Backend Adapter
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure the URL of your FastAPI backend service (Render or localhost).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://expense-management-0ik6.onrender.com"
              className="flex-1"
            />
            <Button
              variant="glow"
              onClick={handleTestBackend}
              disabled={testingConnection}
              className="shrink-0"
            >
              {testingConnection ? "Testing..." : "Save & Test Connection"}
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>Live Render instance:</span>
            <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">
              https://expense-management-0ik6.onrender.com
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Categories Management (Streamlit parity requirement) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" /> Categories Management
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Add new custom categories, rename existing ones, or remove unused categories.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Add form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name (e.g. Healthcare, Travel)"
              className="h-9 text-xs"
            />
            <Button type="submit" size="sm" variant="outline" className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </form>

          {/* Categories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  />
                  <span className="text-xs font-semibold text-foreground">{cat}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingCat(cat);
                      setRenamedValue(cat);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  {cat !== "Other" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCategory(cat)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Reset */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
            <RotateCcw className="h-5 w-5" /> Reset Local Data
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Restore sample expenses and reset categories to their default seed states.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset to Demo Data
          </Button>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      {editingCat && (
        <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Category</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <label className="text-xs font-medium text-foreground">Category Name</label>
              <Input
                value={renamedValue}
                onChange={(e) => setRenamedValue(e.target.value)}
                className="mt-1"
              />
            </div>
            <DialogFooter>
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
