import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  idTranslations,
  enTranslations,
  translate,
  interpolate,
  getNestedValue,
  getStoredLocale,
  setStoredLocale,
  LOCALE_STORAGE_KEY,
  I18nProvider,
  useI18n,
  dictionaries,
  type SupportedLocale,
} from '../lib/i18n';

// Helper to recursively collect all leaf dot-paths
function collectLeafKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(collectLeafKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n Engine & Localization', () => {
  // ── 1. Key Completeness ──
  describe('Key Completeness & Symmetry', () => {
    it('should have 100% key symmetry between id and en dictionaries', () => {
      const idKeys = collectLeafKeys(idTranslations);
      const enKeys = collectLeafKeys(enTranslations);

      const missingInEn = idKeys.filter((k) => !enKeys.includes(k));
      const missingInId = enKeys.filter((k) => !idKeys.includes(k));

      expect(missingInEn).toEqual([]);
      expect(missingInId).toEqual([]);
      expect(idKeys.length).toBe(enKeys.length);
      expect(idKeys.length).toBeGreaterThan(40);
    });

    it('should have all leaf values as non-empty strings in idTranslations', () => {
      const idKeys = collectLeafKeys(idTranslations);
      for (const key of idKeys) {
        const val = getNestedValue(idTranslations, key);
        expect(typeof val).toBe('string');
        expect((val as string).trim().length).toBeGreaterThan(0);
      }
    });

    it('should have all leaf values as non-empty strings in enTranslations', () => {
      const enKeys = collectLeafKeys(enTranslations);
      for (const key of enKeys) {
        const val = getNestedValue(enTranslations, key);
        expect(typeof val).toBe('string');
        expect((val as string).trim().length).toBeGreaterThan(0);
      }
    });

    it('should contain all required schema categories', () => {
      const expectedCategories = [
        'common',
        'header',
        'editor',
        'tabs',
        'audit',
        'switchDialog',
        'customTypeModal',
        'cheatsheet',
        'starters',
      ];

      for (const cat of expectedCategories) {
        expect(idTranslations).toHaveProperty(cat);
        expect(enTranslations).toHaveProperty(cat);
      }
    });
  });

  // ── 2. Translation & Interpolation ──
  describe('t() / translate() function', () => {
    it('should resolve simple top-level category keys', () => {
      expect(translate('id', 'common.save')).toBe('Simpan');
      expect(translate('en', 'common.save')).toBe('Save');
      expect(translate('id', 'common.cancel')).toBe('Batal');
      expect(translate('en', 'common.cancel')).toBe('Cancel');
      expect(translate('id', 'common.close')).toBe('Tutup');
      expect(translate('en', 'common.close')).toBe('Close');
    });

    it('should resolve nested keys accurately', () => {
      // header
      expect(translate('id', 'header.exportPdf')).toBe('Ekspor PDF');
      expect(translate('en', 'header.exportPdf')).toBe('Export PDF');
      expect(translate('id', 'header.exportDocx')).toBe('Ekspor DOCX');
      expect(translate('en', 'header.exportDocx')).toBe('Export DOCX');

      // editor
      expect(translate('id', 'editor.sourceTitle')).toBe('SUMBER MARKDOWN');
      expect(translate('en', 'editor.sourceTitle')).toBe('MARKDOWN SOURCE');

      // tabs
      expect(translate('id', 'tabs.documentPreview')).toBe('Pratinjau Dokumen');
      expect(translate('en', 'tabs.documentPreview')).toBe('Document Preview');

      // audit metrics (deeply nested)
      expect(translate('id', 'audit.metrics.words')).toBe('Kata');
      expect(translate('en', 'audit.metrics.words')).toBe('Words');
      expect(translate('id', 'audit.metrics.diagrams')).toBe('Diagram');
      expect(translate('en', 'audit.metrics.diagrams')).toBe('Diagrams');

      // cheatsheet tabs
      expect(translate('id', 'cheatsheet.tabs.mermaid')).toBe('Diagram Mermaid');
      expect(translate('en', 'cheatsheet.tabs.mermaid')).toBe('Mermaid Diagrams');

      // customTypeModal formLabels
      expect(translate('id', 'customTypeModal.formLabels.name')).toBe('Nama Tipe Dokumen');
      expect(translate('en', 'customTypeModal.formLabels.name')).toBe('Document Type Name');
    });

    it('should interpolate single parameters correctly', () => {
      expect(
        translate('id', 'switchDialog.loadStarter', { target: 'Developer Portfolio' })
      ).toBe('Muat Contoh Developer Portfolio');

      expect(
        translate('en', 'switchDialog.loadStarter', { target: 'Developer Portfolio' })
      ).toBe('Load Developer Portfolio Starter');

      expect(
        translate('id', 'header.recommendedStyles', { type: 'Resume' })
      ).toBe('⭐ Disarankan untuk Resume');

      expect(
        translate('en', 'header.recommendedStyles', { type: 'Resume' })
      ).toBe('⭐ Recommended for Resume');

      expect(
        translate('id', 'editor.wordsCount', { count: 120 })
      ).toBe('120 kata');

      expect(
        translate('en', 'editor.wordsCount', { count: 120 })
      ).toBe('120 words');

      expect(
        translate('id', 'header.customTypesGroup', { count: 3 })
      ).toBe('Tipe Kustom (3)');

      expect(
        translate('en', 'header.customTypesGroup', { count: 3 })
      ).toBe('Custom Types (3)');

      expect(
        translate('id', 'audit.pts', { weight: 20 })
      ).toBe('+20 poin');

      expect(
        translate('en', 'audit.pts', { weight: 20 })
      ).toBe('+20 pts');
    });

    it('should handle interpolate() utility edge cases', () => {
      expect(interpolate('Hello {name}', { name: 'Mark' })).toBe('Hello Mark');
      expect(interpolate('No params here')).toBe('No params here');
      expect(interpolate('Missing {param}')).toBe('Missing {param}');
      expect(interpolate('{a} and {b}', { a: 1, b: 2 })).toBe('1 and 2');
    });
  });

  // ── 3. Fallback Behavior ──
  describe('Fallback Behavior', () => {
    it('should return raw keyPath when key does not exist in any dictionary', () => {
      const nonExistentKey = 'header.completelyInvalidNonExistentKey';
      expect(translate('id', nonExistentKey)).toBe(nonExistentKey);
      expect(translate('en', nonExistentKey)).toBe(nonExistentKey);
    });

    it('should fallback to en dictionary if key is missing in id dictionary', () => {
      // Temporarily mock an incomplete dictionary
      const originalEnValue = dictionaries.en.common.save;
      const fakeKey = 'common.onlyInEnglish';
      (dictionaries.en.common as any).onlyInEnglish = 'English Exclusive';

      try {
        expect(translate('id', fakeKey)).toBe('English Exclusive');
      } finally {
        delete (dictionaries.en.common as any).onlyInEnglish;
      }
    });

    it('should gracefully handle invalid or undefined objects in getNestedValue', () => {
      expect(getNestedValue(null, 'a.b')).toBeUndefined();
      expect(getNestedValue(undefined, 'a.b')).toBeUndefined();
      expect(getNestedValue('string', 'a.b')).toBeUndefined();
      expect(getNestedValue({}, '')).toBeUndefined();
    });
  });

  // ── 4. Locale Switching & LocalStorage Persistence ──
  describe('Locale Switching & Storage Persistence', () => {
    let originalWindow: any;
    let originalLocalStorage: any;
    let storageMap: Record<string, string>;

    beforeEach(() => {
      storageMap = {};
      originalWindow = (globalThis as any).window;
      originalLocalStorage = (globalThis as any).localStorage;

      const mockStorage = {
        getItem: (key: string) => storageMap[key] ?? null,
        setItem: (key: string, val: string) => {
          storageMap[key] = val;
        },
        removeItem: (key: string) => {
          delete storageMap[key];
        },
        clear: () => {
          storageMap = {};
        },
      };

      (globalThis as any).localStorage = mockStorage;
      (globalThis as any).window = { localStorage: mockStorage };
    });

    afterEach(() => {
      (globalThis as any).window = originalWindow;
      (globalThis as any).localStorage = originalLocalStorage;
    });

    it('should return default "id" when localStorage is empty', () => {
      expect(getStoredLocale()).toBe('id');
    });

    it('should read stored "en" locale from localStorage', () => {
      setStoredLocale('en');
      expect(storageMap[LOCALE_STORAGE_KEY]).toBe('en');
      expect(getStoredLocale()).toBe('en');
    });

    it('should fallback to "id" if stored locale is invalid', () => {
      storageMap[LOCALE_STORAGE_KEY] = 'japanese';
      expect(getStoredLocale()).toBe('id');
    });

    it('should update localStorage when setStoredLocale is called', () => {
      setStoredLocale('en');
      expect(storageMap[LOCALE_STORAGE_KEY]).toBe('en');
      setStoredLocale('id');
      expect(storageMap[LOCALE_STORAGE_KEY]).toBe('id');
    });

    it('should render I18nProvider with initial locale and provide translations', () => {
      function TestComponent() {
        const { locale, t } = useI18n();
        return React.createElement(
          'div',
          { 'data-locale': locale },
          t('header.exportPdf')
        );
      }

      // Test with initialLocale="id"
      const idHtml = renderToString(
        React.createElement(
          I18nProvider,
          { initialLocale: 'id' },
          React.createElement(TestComponent)
        )
      );
      expect(idHtml).toContain('data-locale="id"');
      expect(idHtml).toContain('Ekspor PDF');

      // Test with initialLocale="en"
      const enHtml = renderToString(
        React.createElement(
          I18nProvider,
          { initialLocale: 'en' },
          React.createElement(TestComponent)
        )
      );
      expect(enHtml).toContain('data-locale="en"');
      expect(enHtml).toContain('Export PDF');
    });

    it('should allow useI18n outside I18nProvider without throwing (graceful fallback)', () => {
      function StandaloneComponent() {
        const { locale, t } = useI18n();
        return React.createElement('span', null, `${locale}:${t('common.save')}`);
      }

      const html = renderToString(React.createElement(StandaloneComponent));
      expect(html).toContain('id:Simpan');
    });
  });

  // ── 5. Localized Starters Validation ──
  describe('Default Markdown Starters', () => {
    it('should provide complete Indonesian CV starter with ATS formatting', () => {
      const cvId = idTranslations.starters.cv;
      expect(cvId).toContain('# Rafli Arraafi Albaasith');
      expect(cvId).toContain('## Ringkasan Profesional');
      expect(cvId).toContain('## Pengalaman Kerja');
      expect(cvId).toContain('## Pendidikan');
      expect(cvId).toContain('## Keahlian Teknis');
      expect(cvId).toContain('## Proyek Unggulan');
      // Action verbs & quantified metrics
      expect(cvId).toContain('Merancang');
      expect(cvId).toContain('Mengoptimasi');
      expect(cvId).toContain('45%');
    });

    it('should provide complete English CV starter with ATS formatting', () => {
      const cvEn = enTranslations.starters.cv;
      expect(cvEn).toContain('# Jane Doe');
      expect(cvEn).toContain('## Professional Summary');
      expect(cvEn).toContain('## Work Experience');
      expect(cvEn).toContain('## Education');
      expect(cvEn).toContain('## Technical Skills');
      expect(cvEn).toContain('## Featured Projects');
      // Action verbs & quantified metrics
      expect(cvEn).toContain('Architected');
      expect(cvEn).toContain('slashing p99 latency by 45%');
    });

    it('should provide complete Indonesian Portfolio starter with Mermaid diagram', () => {
      const portfolioId = idTranslations.starters.portfolio;
      expect(portfolioId).toContain('# Portofolio: Rafli Arraafi Albaasith');
      expect(portfolioId).toContain('## Tentang Saya');
      expect(portfolioId).toContain('## Arsitektur Sistem Unggulan');
      expect(portfolioId).toContain('```mermaid');
      expect(portfolioId).toContain('## Proyek Pilihan');
      expect(portfolioId).toContain('## Keterampilan Inti & Tech Stack');
    });

    it('should provide complete English Portfolio starter with Mermaid diagram', () => {
      const portfolioEn = enTranslations.starters.portfolio;
      expect(portfolioEn).toContain('# Portfolio: Jane Doe');
      expect(portfolioEn).toContain('## About Me');
      expect(portfolioEn).toContain('## System Architecture');
      expect(portfolioEn).toContain('```mermaid');
      expect(portfolioEn).toContain('## Featured Projects');
      expect(portfolioEn).toContain('## Core Technical Skills');
    });
  });
});
