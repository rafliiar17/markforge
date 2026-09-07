'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  SlidersHorizontal,
  Download,
  BookOpen,
  Cpu,
  Languages,
  Printer,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { McpSetupDialog } from '@/components/modals/mcp-setup-dialog';
import type { DocumentTypeDefinition } from '@markforge/core';

export interface TemplatePresetItem {
  id: string;
  name: string;
  category: string;
}

export const STUDIO_TEMPLATE_PRESETS: TemplatePresetItem[] = [
  { id: 'ats-classic', name: 'ATS Classic (Standard)', category: 'Resume' },
  { id: 'modern-accent', name: 'Modern Emerald', category: 'Resume' },
  { id: 'tech-spec', name: 'Technical Spec / RFC', category: 'Documentation' },
  { id: 'academic', name: 'Academic Whitepaper', category: 'Academic' },
  { id: 'executive', name: 'Executive Leadership', category: 'Executive' },
];

export interface StudioHeaderProps {
  docTypeId: string;
  onDocTypeSelect: (id: string) => void;
  allDocumentTypes: DocumentTypeDefinition[];
  customTypes: DocumentTypeDefinition[];
  onOpenCustomModal: () => void;
  template: string;
  onTemplateSelect: (templateId: string) => void;
  recommendedTemplates: TemplatePresetItem[];
  allTemplates?: TemplatePresetItem[];
  activeDocType: DocumentTypeDefinition;
  onExportDocx: () => void;
  isGeneratingDocx: boolean;
  onExportPdf: () => void;
  isGeneratingPdf: boolean;
  onOpenCheatsheet: () => void;
}

export function StudioHeader({
  docTypeId,
  onDocTypeSelect,
  allDocumentTypes,
  customTypes,
  onOpenCustomModal,
  template,
  onTemplateSelect,
  recommendedTemplates,
  allTemplates = STUDIO_TEMPLATE_PRESETS,
  activeDocType,
  onExportDocx,
  isGeneratingDocx,
  onExportPdf,
  isGeneratingPdf,
  onOpenCheatsheet,
}: StudioHeaderProps) {
  const { locale, setLocale, t } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  const activeDocShortName =
    activeDocType?.name?.split('/')[0].trim().split(' ')[0] || 'Document';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 backdrop-blur-md">
      {/* Brand & Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>MarkForge</span>
        </div>
        <Badge
          variant="outline"
          className="border-emerald-500/40 text-emerald-400 bg-emerald-950/20 text-xs hidden sm:inline-flex"
        >
          {t('common.version') || 'v1.0.0 Open Source'}
        </Badge>
        <Badge
          variant="secondary"
          className="text-xs bg-zinc-800 text-zinc-300 hidden md:inline-flex"
        >
          MD → PDF / DOCX
        </Badge>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Tier 1: Document Type Select */}
        <div className="flex items-center gap-1">
          <div className="w-44 lg:w-48">
            <Select value={docTypeId} onValueChange={onDocTypeSelect}>
              <SelectTrigger className="h-8 bg-zinc-950 border-zinc-700 text-xs text-zinc-200">
                <SelectValue placeholder={t('header.docType') || 'Document Type'} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    {t('header.standardTypes') || 'Standard Types'}
                  </SelectLabel>
                  <SelectItem value="cv" className="text-xs">
                    CV / Resume
                  </SelectItem>
                  <SelectItem value="portfolio" className="text-xs">
                    Developer Portfolio
                  </SelectItem>
                  <SelectItem value="tech-spec" className="text-xs">
                    Tech Spec / RFC
                  </SelectItem>
                  {allDocumentTypes
                    .filter((dt) => !['cv', 'portfolio', 'tech-spec'].includes(dt.id))
                    .map((dt) => (
                      <SelectItem key={dt.id} value={dt.id} className="text-xs">
                        {dt.name}
                      </SelectItem>
                    ))}
                </SelectGroup>

                {customTypes.length > 0 && (
                  <SelectGroup>
                    <SelectSeparator className="bg-zinc-800" />
                    <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      {t('header.customTypesGroup', { count: customTypes.length }) ||
                        `Custom Types (${customTypes.length})`}
                    </SelectLabel>
                    {customTypes.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id} className="text-xs">
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                <SelectGroup>
                  <SelectSeparator className="bg-zinc-800" />
                  <SelectItem
                    value="__add_custom__"
                    className="text-xs text-emerald-400 font-semibold focus:bg-emerald-950/40 focus:text-emerald-300 cursor-pointer"
                  >
                    {t('header.addCustomType') || '+ Add Custom Type...'}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Manage Custom Types Modal Trigger */}
          <Button
            variant="ghost"
            size="sm"
            data-testid="manage-custom-types-btn"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
            onClick={onOpenCustomModal}
            title={t('header.customTypesGroup', { count: customTypes.length }) || 'Manage Custom Types'}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Tier 2: Template Style Select */}
        <div className="w-44 lg:w-52">
          <Select value={template} onValueChange={onTemplateSelect}>
            <SelectTrigger className="h-8 bg-zinc-950 border-zinc-700 text-xs text-zinc-200">
              <SelectValue placeholder={t('header.templateStyle') || 'Select Style'} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              {recommendedTemplates.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    {t('header.recommendedStyles', { type: activeDocShortName }) ||
                      `⭐ Recommended for ${activeDocShortName}`}
                  </SelectLabel>
                  {recommendedTemplates.map((tItem) => (
                    <SelectItem
                      key={`rec-${tItem.id}`}
                      value={tItem.id}
                      className="text-xs font-medium"
                    >
                      {tItem.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}

              <SelectGroup>
                {recommendedTemplates.length > 0 && <SelectSeparator className="bg-zinc-800" />}
                <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                  {t('header.allStyles') || '🌐 All Available Styles'}
                </SelectLabel>
                {allTemplates.map((tItem) => (
                  <SelectItem key={`all-${tItem.id}`} value={tItem.id} className="text-xs">
                    {tItem.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Export DOCX Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-100"
          onClick={onExportDocx}
          disabled={isGeneratingDocx}
        >
          <Download className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
          {isGeneratingDocx
            ? t('header.compiling') || 'Compiling...'
            : t('header.exportDocx') || 'Export DOCX'}
        </Button>

        {/* Export PDF Button */}
        <Button
          size="sm"
          variant="emerald"
          className="h-8 text-xs font-semibold"
          onClick={onExportPdf}
          disabled={isGeneratingPdf}
        >
          <Download className="mr-1.5 h-3.5 w-3.5 text-white" />
          {isGeneratingPdf
            ? t('header.compiling') || 'Compiling...'
            : t('header.exportPdf') || 'Export PDF'}
        </Button>

        {/* Browser Print / Fallback PDF Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-zinc-300 hover:text-white"
          onClick={() => window.print()}
          title={t('header.printBrowser')}
        >
          <Printer className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
          <span className="hidden lg:inline">{t('header.printBrowser')}</span>
        </Button>

        {/* Markdown Format Guide Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-zinc-300 hover:text-white"
          onClick={onOpenCheatsheet}
          title={t('header.syntaxGuide') || 'Buka panduan format Markdown & legenda simbol'}
        >
          <BookOpen className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{t('header.syntaxGuide') || 'Panduan Sintaks'}</span>
        </Button>

        {/* MCP Setup Dialog Trigger */}
        <McpSetupDialog
          trigger={
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-zinc-300 hover:text-white"
            >
              <Cpu className="mr-1.5 h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">{t('header.mcpServer') || 'MCP Server'}</span>
            </Button>
          }
        />

        {/* Language Switcher Toggle */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5 border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
          onClick={toggleLocale}
          title={t('header.langSwitch') || (locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia')}
        >
          <Languages className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
          <span>{locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
        </Button>
      </div>
    </header>
  );
}
