'use client';

import React, { useState, useEffect } from 'react';
import { listDocumentTypes, getDocumentType, BUILTIN_DOCUMENT_TYPES, type DocumentTypeDefinition } from '@markforge/core';
import { StudioHeader, STUDIO_TEMPLATE_PRESETS, EditorPane, PreviewPane } from '@/components/studio';
import { TemplateSwitchDialog, CustomTypeModal, MarkdownCheatsheetModal, loadCustomTypesFromStorage } from '@/components/modals';
import { generateLocalPreview } from '@/lib/preview-generator';
import { DEFAULT_MARKDOWN, MERMAID_SNIPPET } from '@/lib/default-content';
import { exportDocument } from '@/lib/exporter';

export default function MarkForgeStudio() {
  const [docTypeId, setDocTypeId] = useState('cv');
  const [customTypes, setCustomTypes] = useState<DocumentTypeDefinition[]>([]);
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [template, setTemplate] = useState('ats-classic');
  const [activeTab, setActiveTab] = useState('preview');
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const [pendingTargetTypeId, setPendingTargetTypeId] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [atsReport, setAtsReport] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);

  const allDocumentTypes = [...listDocumentTypes(), ...customTypes];
  const activeDocType = allDocumentTypes.find((d) => d.id === docTypeId) || getDocumentType(docTypeId) || BUILTIN_DOCUMENT_TYPES['cv'];
  const pendingTargetType = pendingTargetTypeId ? allDocumentTypes.find((d) => d.id === pendingTargetTypeId) || getDocumentType(pendingTargetTypeId) : null;
  const recommendedTemplates = STUDIO_TEMPLATE_PRESETS.filter((t) => activeDocType?.recommendedTemplateIds?.includes(t.id) || t.id === activeDocType?.defaultTemplateId);

  const runAnalysis = async (content: string, typeId = docTypeId, rubric?: any) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: content, docTypeId: typeId, customRubric: rubric || activeDocType?.auditRubric }),
      });
      if (res.ok) setAtsReport(await res.json());
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    setCustomTypes(loadCustomTypesFromStorage());
    runAnalysis(markdown, 'cv');
  }, []);

  useEffect(() => {
    setIsUpdatingPreview(true);
    setPreviewHtml(generateLocalPreview(markdown, template));
    const timer = setTimeout(() => setIsUpdatingPreview(false), 120);
    return () => clearTimeout(timer);
  }, [markdown, template]);

  const handleDocTypeSelect = (targetId: string) => {
    if (targetId === '__add_custom__') return setIsCustomModalOpen(true);
    if (targetId === docTypeId) return;
    const targetType = allDocumentTypes.find((d) => d.id === targetId) || getDocumentType(targetId);
    if (!targetType) return;
    if (activeDocType && markdown.trim() === (activeDocType.starterMarkdown || '').trim()) {
      setDocTypeId(targetId);
      setMarkdown(targetType.starterMarkdown);
      setTemplate(targetType.defaultTemplateId || 'ats-classic');
      runAnalysis(targetType.starterMarkdown, targetId, targetType.auditRubric);
    } else {
      setPendingTargetTypeId(targetId);
      setIsSwitchDialogOpen(true);
    }
  };

  const handleExport = async (type: 'docx' | 'pdf') => {
    const setLoading = type === 'docx' ? setIsGeneratingDocx : setIsGeneratingPdf;
    setLoading(true);
    try {
      await exportDocument(type, markdown, template);
    } catch (e: any) {
      alert(`Error exporting ${type.toUpperCase()}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) { setMarkdown(text); runAnalysis(text); }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <StudioHeader
        docTypeId={docTypeId} onDocTypeSelect={handleDocTypeSelect} allDocumentTypes={allDocumentTypes}
        customTypes={customTypes} onOpenCustomModal={() => setIsCustomModalOpen(true)}
        template={template} onTemplateSelect={setTemplate} recommendedTemplates={recommendedTemplates}
        activeDocType={activeDocType} onExportDocx={() => handleExport('docx')} isGeneratingDocx={isGeneratingDocx}
        onExportPdf={() => handleExport('pdf')} isGeneratingPdf={isGeneratingPdf} onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorPane
          markdown={markdown} onMarkdownChange={setMarkdown} onDrop={handleDrop}
          onOpenCheatsheet={() => setIsCheatsheetOpen(true)} onInsertMermaid={() => setMarkdown((prev) => prev + MERMAID_SNIPPET)}
          onAnalyze={() => {
            runAnalysis(markdown, docTypeId, activeDocType?.auditRubric);
            setActiveTab('ats');
          }}
          isAnalyzing={isAnalyzing} docTypeId={docTypeId} activeDocType={activeDocType}
        />
        <PreviewPane
          activeTab={activeTab} onTabChange={setActiveTab} previewHtml={previewHtml} isUpdatingPreview={isUpdatingPreview}
          template={template} docTypeId={docTypeId} activeDocType={activeDocType} atsReport={atsReport} isAnalyzing={isAnalyzing}
        />
      </div>
      {pendingTargetType && (
        <TemplateSwitchDialog
          open={isSwitchDialogOpen}
          currentType={{ id: activeDocType.id, name: activeDocType.name, description: activeDocType.description }}
          targetType={{ id: pendingTargetType.id, name: pendingTargetType.name, description: pendingTargetType.description }}
          onConfirm={(loadStarter) => {
            setDocTypeId(pendingTargetType.id);
            setTemplate(pendingTargetType.defaultTemplateId || 'ats-classic');
            const targetContent = loadStarter ? pendingTargetType.starterMarkdown : markdown;
            if (loadStarter) setMarkdown(pendingTargetType.starterMarkdown);
            runAnalysis(targetContent, pendingTargetType.id, pendingTargetType.auditRubric);
            setIsSwitchDialogOpen(false);
            setPendingTargetTypeId(null);
          }}
          onCancel={() => { setIsSwitchDialogOpen(false); setPendingTargetTypeId(null); }}
        />
      )}
      <CustomTypeModal open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen} onCustomTypesChange={setCustomTypes} onSelectType={handleDocTypeSelect} />
      <MarkdownCheatsheetModal isOpen={isCheatsheetOpen} onOpenChange={setIsCheatsheetOpen} onInsertSnippet={(snip) => setMarkdown((p) => p + '\n\n' + snip)} />
    </div>
  );
}
