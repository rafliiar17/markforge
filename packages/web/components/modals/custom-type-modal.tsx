'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Plus,
  Trash2,
  Download,
  Upload,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import type { DocumentTypeDefinition, DocumentCategory, AuditRubricConfig } from '@markforge/core';

export const CUSTOM_TYPES_STORAGE_KEY = 'markforge_custom_types';

export function loadCustomTypesFromStorage(): DocumentTypeDefinition[] {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return [];
  try {
    const storage = typeof localStorage !== 'undefined' ? localStorage : window?.localStorage;
    if (!storage) return [];
    const raw = storage.getItem(CUSTOM_TYPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load custom types:', err);
    return [];
  }
}

export function saveCustomTypesToStorage(types: DocumentTypeDefinition[]): void {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
  try {
    const storage = typeof localStorage !== 'undefined' ? localStorage : window?.localStorage;
    if (!storage) return;
    storage.setItem(CUSTOM_TYPES_STORAGE_KEY, JSON.stringify(types));
  } catch (err) {
    console.error('Failed to save custom types:', err);
  }
}

export interface CustomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomTypesChange?: (types: DocumentTypeDefinition[]) => void;
  onSelectType?: (typeId: string) => void;
}

const TEMPLATE_OPTIONS = [
  { id: 'ats-classic', label: 'ATS Classic (Standard)' },
  { id: 'modern-accent', label: 'Modern Emerald' },
  { id: 'tech-spec', label: 'Technical Spec / RFC' },
  { id: 'academic', label: 'Academic Whitepaper' },
  { id: 'executive', label: 'Executive Leadership' },
];

export function CustomTypeModal({
  open,
  onOpenChange,
  onCustomTypesChange,
  onSelectType,
}: CustomTypeModalProps) {
  const [customTypes, setCustomTypes] = useState<DocumentTypeDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [typeName, setTypeName] = useState('');
  const [categorySlug, setCategorySlug] = useState('custom');
  const [description, setDescription] = useState('');
  const [defaultTemplate, setDefaultTemplate] = useState('tech-spec');
  const [starterMarkdown, setStarterMarkdown] = useState('');
  const [requiredHeadingsStr, setRequiredHeadingsStr] = useState('Overview, Architecture, Security');
  const [detectLinks, setDetectLinks] = useState(true);
  const [detectDiagrams, setDetectDiagrams] = useState(true);
  const [detectMetrics, setDetectMetrics] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load types on mount & when open changes
  useEffect(() => {
    if (open) {
      const loaded = loadCustomTypesFromStorage();
      setCustomTypes(loaded);
      setFeedbackMsg(null);
      if (loaded.length > 0 && !selectedId) {
        populateForm(loaded[0]);
      } else if (loaded.length === 0) {
        resetFormToBlank();
      }
    }
  }, [open]);

  const populateForm = (docType: DocumentTypeDefinition) => {
    setSelectedId(docType.id);
    setTypeName(docType.name);
    setCategorySlug(docType.category || 'custom');
    setDescription(docType.description || '');
    setDefaultTemplate(docType.defaultTemplateId || 'tech-spec');
    setStarterMarkdown(docType.starterMarkdown || '');
    setRequiredHeadingsStr((docType.auditRubric?.requiredHeadings || []).join(', '));
    setDetectLinks(!!docType.auditRubric?.detectLinks);
    setDetectDiagrams(!!docType.auditRubric?.detectDiagrams);
    setDetectMetrics(!!docType.auditRubric?.detectMetrics);
  };

  const resetFormToBlank = () => {
    setSelectedId(null);
    setTypeName('');
    setCategorySlug('custom');
    setDescription('');
    setDefaultTemplate('tech-spec');
    setStarterMarkdown('# New Document\n\n## Overview\nDescription of this document.\n\n## Architecture\nDetails here.\n');
    setRequiredHeadingsStr('Overview, Architecture, Security');
    setDetectLinks(true);
    setDetectDiagrams(true);
    setDetectMetrics(false);
  };

  // Handle Save
  const handleSave = () => {
    if (!typeName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Document Type Name is required.' });
      return;
    }

    const headings = requiredHeadingsStr
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const rubric: AuditRubricConfig = {
      type: 'custom-checklist',
      label: `${typeName.trim()} Audit Rubric`,
      requiredHeadings: headings,
      detectLinks,
      detectDiagrams,
      detectMetrics,
    };

    const id = selectedId || `custom-${typeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newType: DocumentTypeDefinition = {
      id,
      name: typeName.trim(),
      category: (categorySlug.trim().toLowerCase() || 'custom') as DocumentCategory,
      description: description.trim() || `Custom document type: ${typeName.trim()}`,
      defaultTemplateId: defaultTemplate,
      recommendedTemplateIds: [defaultTemplate],
      starterMarkdown: starterMarkdown.trim() || `# ${typeName.trim()}\n\n## Overview\nStarter text.\n`,
      auditRubric: rubric,
      isCustom: true,
    };

    let updated: DocumentTypeDefinition[];
    if (selectedId) {
      updated = customTypes.map((t) => (t.id === selectedId ? newType : t));
    } else {
      updated = [...customTypes, newType];
    }

    saveCustomTypesToStorage(updated);
    setCustomTypes(updated);
    setSelectedId(newType.id);
    onCustomTypesChange?.(updated);
    setFeedbackMsg({ type: 'success', text: `Saved custom type "${newType.name}"!` });
  };

  // Handle Delete
  const handleDelete = (idToDelete: string) => {
    const updated = customTypes.filter((t) => t.id !== idToDelete);
    saveCustomTypesToStorage(updated);
    setCustomTypes(updated);
    onCustomTypesChange?.(updated);
    if (selectedId === idToDelete) {
      if (updated.length > 0) {
        populateForm(updated[0]);
      } else {
        resetFormToBlank();
      }
    }
    setFeedbackMsg({ type: 'success', text: 'Custom type deleted.' });
  };

  // Export JSON
  const handleExportJson = () => {
    if (customTypes.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'No custom document types to export.' });
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customTypes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'markforge-custom-types.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedbackMsg({ type: 'success', text: `Exported ${customTypes.length} custom types to JSON.` });
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        const importedItems: DocumentTypeDefinition[] = Array.isArray(parsed) ? parsed : [parsed];

        // Basic validation
        const validItems = importedItems.filter((it) => it && it.name);
        if (validItems.length === 0) {
          throw new Error('No valid document types found in JSON file.');
        }

        const currentMap = new Map(customTypes.map((t) => [t.id, t]));
        for (const it of validItems) {
          const id = it.id || `custom-${it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
          currentMap.set(id, {
            ...it,
            id,
            isCustom: true,
            category: (it.category || 'custom') as DocumentCategory,
            defaultTemplateId: it.defaultTemplateId || 'tech-spec',
            recommendedTemplateIds: it.recommendedTemplateIds || [it.defaultTemplateId || 'tech-spec'],
            auditRubric: it.auditRubric || {
              type: 'custom-checklist',
              label: `${it.name} Audit`,
              requiredHeadings: ['Overview'],
              detectLinks: true,
              detectDiagrams: true,
            },
          });
        }

        const merged = Array.from(currentMap.values());
        saveCustomTypesToStorage(merged);
        setCustomTypes(merged);
        onCustomTypesChange?.(merged);
        if (validItems[0]) {
          populateForm(validItems[0]);
        }
        setFeedbackMsg({ type: 'success', text: `Imported ${validItems.length} custom types!` });
      } catch (err: any) {
        setFeedbackMsg({ type: 'error', text: `Import failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[85vh] flex flex-col p-6 shadow-2xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Custom Document Types Manager
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                onClick={handleExportJson}
                title="Download custom types as JSON"
              >
                <Download className="mr-1 h-3.5 w-3.5 text-blue-400" />
                Export JSON
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportJson}
                />
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  <span>
                    <Upload className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                    Import JSON
                  </span>
                </Button>
              </label>
            </div>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            Define custom document schemas, default layouts, starter text, and automated audit checklist rubrics.
          </DialogDescription>
        </DialogHeader>

        {feedbackMsg && (
          <div className="shrink-0 pt-2">
            <Alert
              variant={feedbackMsg.type === 'success' ? 'default' : 'destructive'}
              className={`py-2 px-3 text-xs ${
                feedbackMsg.type === 'success'
                  ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-red-800/60 bg-red-950/40 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            </Alert>
          </div>
        )}

        <div className="flex flex-1 gap-4 overflow-hidden pt-3">
          {/* Left Column: Types List */}
          <div className="w-1/3 flex flex-col border-r border-zinc-800 pr-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                My Types ({customTypes.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1.5 text-xs text-emerald-400 hover:bg-emerald-950/30"
                onClick={resetFormToBlank}
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" />
                New
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {customTypes.length === 0 ? (
                <div className="p-3 text-center text-xs text-zinc-500 rounded border border-dashed border-zinc-800">
                  No custom types yet. Click "New" to create one!
                </div>
              ) : (
                customTypes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => populateForm(t)}
                    className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors border ${
                      selectedId === t.id
                        ? 'bg-zinc-800/90 border-emerald-500/50 text-white font-medium'
                        : 'bg-zinc-950/50 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <div className="truncate mr-1">
                      <div className="truncate">{t.name}</div>
                      <span className="text-[10px] text-zinc-500">{t.category}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t.id);
                      }}
                      title="Delete this custom type"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Edit / Create Form */}
          <div className="flex-1 overflow-y-auto pl-1 pr-2 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Type Name *
                </label>
                <Input
                  className="h-8 bg-zinc-950 border-zinc-800 text-xs text-zinc-100"
                  placeholder="e.g. API Specification"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Category Slug
                </label>
                <Input
                  className="h-8 bg-zinc-950 border-zinc-800 text-xs text-zinc-100"
                  placeholder="e.g. documentation, api"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Description
              </label>
              <Input
                className="h-8 bg-zinc-950 border-zinc-800 text-xs text-zinc-100"
                placeholder="Brief summary of this document format..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Default Template Style
              </label>
              <Select value={defaultTemplate} onValueChange={setDefaultTemplate}>
                <SelectTrigger className="h-8 bg-zinc-950 border-zinc-800 text-xs text-zinc-200">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audit Checklist Rules */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Audit Checklist Rules</span>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">
                  Required Headings (comma-separated)
                </label>
                <Input
                  className="h-7 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
                  placeholder="e.g. Overview, Architecture, Testing, Security"
                  value={requiredHeadingsStr}
                  onChange={(e) => setRequiredHeadingsStr(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant={detectLinks ? 'emerald' : 'outline'}
                  className={`h-7 text-[11px] justify-start ${!detectLinks ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : ''}`}
                  onClick={() => setDetectLinks(!detectLinks)}
                >
                  <CheckCircle2 className={`mr-1.5 h-3 w-3 ${detectLinks ? 'text-white' : 'text-zinc-600'}`} />
                  Detect Links
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={detectDiagrams ? 'emerald' : 'outline'}
                  className={`h-7 text-[11px] justify-start ${!detectDiagrams ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : ''}`}
                  onClick={() => setDetectDiagrams(!detectDiagrams)}
                >
                  <CheckCircle2 className={`mr-1.5 h-3 w-3 ${detectDiagrams ? 'text-white' : 'text-zinc-600'}`} />
                  Detect Diagrams
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={detectMetrics ? 'emerald' : 'outline'}
                  className={`h-7 text-[11px] justify-start ${!detectMetrics ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : ''}`}
                  onClick={() => setDetectMetrics(!detectMetrics)}
                >
                  <CheckCircle2 className={`mr-1.5 h-3 w-3 ${detectMetrics ? 'text-white' : 'text-zinc-600'}`} />
                  Detect Metrics
                </Button>
              </div>
            </div>

            {/* Starter Markdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-zinc-300">
                  Starter Markdown Template
                </label>
                <span className="text-[10px] text-zinc-500">Used when creating or resetting</span>
              </div>
              <textarea
                className="h-28 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] leading-relaxed text-zinc-200 outline-none focus:border-emerald-500/50"
                value={starterMarkdown}
                onChange={(e) => setStarterMarkdown(e.target.value)}
                placeholder="# Document Title..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <div>
            {selectedId && onSelectType && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-emerald-700/60 text-emerald-400 hover:bg-emerald-950/40"
                onClick={() => {
                  onSelectType(selectedId);
                  onOpenChange(false);
                }}
              >
                Use this Type in Studio
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="emerald"
              size="sm"
              className="text-xs font-semibold"
              onClick={handleSave}
            >
              Save Custom Type
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
