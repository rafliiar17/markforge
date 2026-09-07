export type SupportedLocale = 'id' | 'en';

export interface AuditMetricsTranslations {
  words: string;
  readingTime: string;
  links: string;
  diagrams: string;
  metricPoints: string;
  actionVerbs: string;
  quantified: string;
}

export interface CustomTypeModalFormLabels {
  name: string;
  category: string;
  description: string;
  defaultTemplate: string;
  starterMarkdown: string;
  requiredHeadings: string;
  detectLinks: string;
  detectDiagrams: string;
  detectMetrics: string;
}

export interface CheatsheetTabsTranslations {
  links: string;
  typography: string;
  lists: string;
  mermaid: string;
  tips: string;
}

export interface TranslationSchema {
  common: {
    appTitle: string;
    tagLine: string;
    save: string;
    cancel: string;
    close: string;
    copy: string;
    copied: string;
    download: string;
    loading: string;
    error: string;
    success: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    confirm: string;
    version: string;
  };
  header: {
    docType: string;
    templateStyle: string;
    exportDocx: string;
    exportPdf: string;
    printBrowser?: string;
    compiling: string;
    mcpServer: string;
    syntaxGuide: string;
    langSwitch: string;
    standardTypes: string;
    customTypesGroup: string;
    addCustomType: string;
    recommendedStyles: string;
    allStyles: string;
    mcpTitle: string;
    mcpDesc: string;
    mcpToolsIncluded: string;
  };
  editor: {
    sourceTitle: string;
    dropzoneHint: string;
    formatGuide: string;
    mermaidFlow: string;
    analyzeAts: string;
    analyzePortfolio: string;
    analyzeSpec: string;
    analyzing: string;
    wordsCount: string;
    placeholder: string;
  };
  tabs: {
    documentPreview: string;
    auditScorecard: string;
    rawOutput: string;
    parityBadge: string;
  };
  audit: {
    scoreLabel: string;
    gradeLabel: string;
    metrics: AuditMetricsTranslations;
    checklistTitle: string;
    passed: string;
    failed: string;
    recommendationsTitle: string;
    scoreSummaryExcellent: string;
    scoreSummaryGood: string;
    scoreSummaryNeedsWork: string;
    pts: string;
    found: string;
    missing: string;
  };
  switchDialog: {
    title: string;
    currentDoc: string;
    targetDoc: string;
    loadStarter: string;
    keepText: string;
    cancel: string;
    description: string;
    tip: string;
  };
  customTypeModal: {
    title: string;
    subtitle: string;
    formLabels: CustomTypeModalFormLabels;
    addHeading: string;
    detectLinks: string;
    detectDiagrams: string;
    exportJson: string;
    importJson: string;
    saveType: string;
    cancel: string;
    deleteType: string;
    successCreated: string;
    successUpdated: string;
    validationError: string;
  };
  cheatsheet: {
    title: string;
    subtitle: string;
    tabs: CheatsheetTabsTranslations;
    copy: string;
    copied: string;
    insertToEditor: string;
    tipFooter: string;
  };
  starters: {
    cv: string;
    portfolio: string;
  };
}

// Utility types for recursive dot-separated path keys
type Prev = [never, 0, 1, 2, 3, 4, 5];

type Leaves<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | (Leaves<T[K], Prev[D]> extends never ? never : `${K}.${Leaves<T[K], Prev[D]>}`)
        : never;
    }[keyof T]
  : never;

export type TranslationKey = Leaves<TranslationSchema>;

export type TranslationParams = Record<string, string | number>;

export type TranslateFunction = (
  keyPath: TranslationKey | (string & {}),
  params?: TranslationParams
) => string;

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslateFunction;
  dictionary: TranslationSchema;
}
