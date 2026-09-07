'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Link2,
  Type,
  ListOrdered,
  Workflow,
  Sparkles,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

interface MarkdownCheatsheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertSnippet?: (snippet: string) => void;
}

interface CheatsheetItem {
  name: string;
  syntax: string;
  description: string;
  previewNote: string;
  badge?: string;
}

export function MarkdownCheatsheetModal({
  isOpen,
  onOpenChange,
  onInsertSnippet,
}: MarkdownCheatsheetModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const linkItems: CheatsheetItem[] = [
    {
      name: 'Hyperlink Interaktif (PDF & DOCX Clickable)',
      syntax: '[LinkedIn: rafliiarz](https://linkedin.com/in/rafliiarz)',
      description: 'Menampilkan teks ringkas berwarna aksen bergaris bawah. Di PDF dan DOCX menjadi tautan aktif yang bisa diklik langsung oleh HR/klien.',
      previewNote: 'Hanya tampil teks "LinkedIn: rafliiarz", URL tersembunyi di balik tautan.',
      badge: 'Paling Sering Digunakan',
    },
    {
      name: 'Tautan Email (Mailto)',
      syntax: '[Email Saya](mailto:rafli@example.com)',
      description: 'Saat diklik di PDF / web, langsung membuka aplikasi email default pembaca.',
      previewNote: 'Tampil "Email Saya", otomatis memicu client email.',
    },
    {
      name: 'Baris Kontak Otomatis (Contact Bar)',
      syntax: 'Jakarta, ID • [Email](mailto:rafli@example.com) • [LinkedIn](https://linkedin.com/in/rafliiarz) • [GitHub](https://github.com/rafliiarz) • [Portfolio](https://rafli.dev)',
      description: 'Baris di awal dokumen yang dipisahkan simbol "•" atau "|" otomatis dikenali sebagai Contact Bar ATS dengan garis pemisah elegan.',
      previewNote: 'Diformat di tengah (center aligned) dengan border pembatas di bawahnya.',
      badge: 'ATS Heuristic',
    },
  ];

  const typographyItems: CheatsheetItem[] = [
    {
      name: 'Nama / Judul Utama (H1)',
      syntax: '# Rafli Arraafi Albaasith',
      description: 'Judul utama dokumen. Pada template CV/Resume otomatis diletakkan di tengah (center aligned).',
      previewNote: 'Ukuran font 24pt bold dengan warna heading template.',
    },
    {
      name: 'Sub-Judul / Jabatan (Subtitle)',
      syntax: '*Senior Full Stack & Cloud Platform Engineer*',
      description: 'Baris teks miring (*...*) tepat di bawah H1 otomatis diposisikan sebagai sub-judul atau peran profesional.',
      previewNote: 'Font 11pt italic berwarna abu-abu profesional.',
    },
    {
      name: 'Header Bagian / Section (H2)',
      syntax: '## Work Experience\n## Technical Skills\n## Featured Projects',
      description: 'Menandai bagian utama resume/dokumen. Otomatis diberi garis bawah tebal (divider) dan huruf kapital pada template CV.',
      previewNote: 'Font 11pt bold dengan border-bottom aksen.',
      badge: 'ATS Mandatory',
    },
    {
      name: 'Posisi & Perusahaan (H3)',
      syntax: '### Staff Software Engineer | ApexCloud Technologies',
      description: 'Digunakan untuk judul pengalaman kerja, nama institusi pendidikan, atau nama proyek unggulan.',
      previewNote: 'Font 10pt bold tebal.',
    },
    {
      name: 'Periode & Lokasi (H4 atau Italic)',
      syntax: '*2022 - Sekarang | Jakarta, Indonesia*',
      description: 'Keterangan tanggal dan lokasi yang diletakkan di bawah H3.',
      previewNote: 'Font 9.5pt subtle italic.',
    },
    {
      name: 'Teks Tebal (Bold) & Miring (Italic)',
      syntax: '**Teks Penting (Bold)** dan *Teks Penekanan (Italic)*',
      description: 'Gunakan bintang ganda (**) untuk tebal dan bintang tunggal (*) untuk miring.',
      previewNote: 'Bagus untuk menyorot kata kunci tech stack atau metrik penting.',
    },
    {
      name: 'Kode Inline (Code Pill)',
      syntax: 'Menggunakan `TypeScript`, `Docker`, dan `Kubernetes` di production.',
      description: 'Teks yang diapit backtick (`) otomatis diberi latar belakang abu-abu lembut mirip badge.',
      previewNote: 'Font monospace bersih dengan latar belakang rounded.',
    },
    {
      name: 'Kutipan / Highlight (Blockquote)',
      syntax: '> "Membangun sistem dengan ketersediaan 99.999% SLA untuk 10M+ pengguna."',
      description: 'Awali baris dengan "> " untuk membuat blok kutipan dengan border tebal di sisi kiri.',
      previewNote: 'Tepi kiri beraksen warna tema.',
    },
    {
      name: 'Garis Pembatas Horizontal (Divider)',
      syntax: '---',
      description: 'Tiga tanda strip berturut-turut untuk memisahkan bab atau lampiran.',
      previewNote: 'Garis tipis elegan memotong dokumen.',
    },
  ];

  const listAndTableItems: CheatsheetItem[] = [
    {
      name: 'Daftar Butir Bertingkat (Nested Bullet Points)',
      syntax: `- Memimpin migrasi microservices dari arsitektur monolitik.
  - Memangkas latensi p99 hingga 45% (dari 320ms menjadi 42ms).
  - Menghemat biaya server hingga $180,000 per tahun.
- Mementori 8 engineer junior dalam praktik TDD dan clean architecture.`,
      description: 'Gunakan tanda strip (-) dengan indentasi 2 spasi untuk sub-poin (level 2). Format ini paling optimal dibaca mesin parser ATS.',
      previewNote: 'Bullet point bulat rapi dengan spasi vertikal proporsional.',
      badge: 'ATS Recommended',
    },
    {
      name: 'Tabel Terstruktur (Markdown Table)',
      syntax: `| Kategori | Teknologi & Framework | Pengalaman |
| --- | --- | --- |
| Bahasa Pemrograman | TypeScript, Go, Python, SQL | 5+ Tahun |
| Cloud & DevOps | AWS, Cloudflare Workers, Docker, K8s | 4 Tahun |
| Database | PostgreSQL, Redis, ClickHouse | 4 Tahun |`,
      description: 'Tabel standar markdown dengan header row. Di PDF dan DOCX otomatis diberi warna header sesuai template.',
      previewNote: 'Header tabel berwarna aksen dengan border sel yang presisi.',
    },
  ];

  const mermaidItems: CheatsheetItem[] = [
    {
      name: 'Flowchart Alur Sistem (graph TD / LR)',
      syntax: `\`\`\`mermaid
graph TD
  A[Client Request] --> B[API Gateway]
  B --> C[Auth Middleware]
  C --> D[(PostgreSQL)]
  C --> E[(Redis Cache)]
\`\`\``,
      description: 'Diagram alur visual. "graph TD" untuk atas-ke-bawah (Top-Down), atau "graph LR" untuk kiri-ke-kanan (Left-Right).',
      previewNote: 'Dirender jadi SVG interaktif di Web Studio, callout terbingkai di Word DOCX, dan vektor tajam di PDF.',
      badge: 'Tech Spec',
    },
    {
      name: 'Diagram Sekuensial (sequenceDiagram)',
      syntax: `\`\`\`mermaid
sequenceDiagram
  autonumber
  actor User as Pengguna
  participant Web as MarkForge Studio
  participant Core as Compiler Engine
  User->>Web: Input Markdown & Klik Export
  Web->>Core: Kirim AST & Opsi Template
  Core-->>Web: Return Buffer PDF & DOCX
  Web-->>User: Unduh File Dokumen
\`\`\``,
      description: 'Diagram urutan pesan antar layanan atau aktor sistem.',
      previewNote: 'Sangat ideal untuk Tech Spec, RFC, dan dokumentasi arsitektur.',
      badge: 'Architecture',
    },
  ];

  const auditTips: CheatsheetItem[] = [
    {
      name: 'Formula Skor ATS CV Tinggi (Skor 90-100)',
      syntax: `- Pastikan ada info kontak: Email valid, Nomor Telepon, LinkedIn, dan Kota.
- Sertakan minimal 4 section standar:
  ## Professional Summary
  ## Work Experience
  ## Education
  ## Technical Skills
- Gunakan Kata Kerja Aksi (Action Verbs) di setiap poin:
  "Architected", "Engineered", "Optimized", "Spearheaded", "Mentored".
- Sertakan Angka & Metrik Kuantitatif: "45%", "2.4M", "60M+", "$180,000".`,
      description: 'MarkForge menggunakan algoritma ATS Heuristic yang mencocokkan pola format dokumen standar industri recruitment global.',
      previewNote: 'Cek tab "ATS Audit" di studio untuk melihat nilai dan checklist kepatuhan dokumenmu.',
      badge: 'Audit Tips',
    },
    {
      name: 'Formula Skor Developer Portfolio Tinggi',
      syntax: `## Featured Projects
### CloudPulse APM | [Live Demo](https://cloudpulse.dev) • [GitHub](https://github.com/org/repo)
*Stack: Go, ClickHouse, React, Tailwind CSS*
- Memantau 10,000+ container aktif secara real-time dengan latensi sub-15ms.
- Mengurangi false-positive alerts sebesar 65% menggunakan deteksi anomali.`,
      description: 'Analyzer Portfolio MarkForge mendeteksi tautan aktif (Live Demo / GitHub), tag teknologi, dan metrik dampak bisnis/performa.',
      previewNote: 'Cek tab "Portfolio Audit" untuk rekomendasi kelengkapan showcase proyek.',
      badge: 'Portfolio Tips',
    },
  ];

  const renderSection = (items: CheatsheetItem[]) => (
    <div className="space-y-3.5 pr-1">
      {items.map((item, idx) => {
        const itemKey = `${item.name}-${idx}`;
        const isCopied = copiedKey === itemKey;

        return (
          <div
            key={itemKey}
            className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3.5 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-200">{item.name}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-[10px] py-0 border-emerald-600/40 text-emerald-400 bg-emerald-950/20">
                    {item.badge}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {onInsertSnippet && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[11px] text-zinc-400 hover:text-emerald-300"
                    onClick={() => {
                      onInsertSnippet(item.syntax);
                      onOpenChange(false);
                    }}
                    title="Sisipkan ke editor"
                  >
                    Sisipkan ke Editor
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px] border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                  onClick={() => copyToClipboard(item.syntax, itemKey)}
                  title="Salin sintaks"
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-emerald-400" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Salin
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">{item.description}</p>

            <div className="rounded-md bg-zinc-950 p-2.5 font-mono text-xs text-emerald-300 border border-zinc-800/80 overflow-x-auto whitespace-pre">
              {item.syntax}
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="font-semibold text-zinc-400">💡 Hasil Render:</span>
              <span>{item.previewNote}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[88vh] flex flex-col p-6 shadow-2xl">
        <DialogHeader className="shrink-0 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                Legenda & Panduan Format Markdown MarkForge
                <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300">
                  PDF • DOCX • Live Web
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                Panduan simbol dan tata cara penulisan Markdown agar ter-render sempurna menjadi PDF profesional dan dokumen Word.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden pt-3">
          <Tabs defaultValue="links" className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-zinc-950 border border-zinc-800 p-1 mb-3">
              <TabsTrigger value="links" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" />
                Tautan & Kontak
              </TabsTrigger>
              <TabsTrigger value="typography" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 flex items-center gap-1">
                <Type className="h-3.5 w-3.5" />
                Tipografi
              </TabsTrigger>
              <TabsTrigger value="lists" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 flex items-center gap-1">
                <ListOrdered className="h-3.5 w-3.5" />
                Daftar & Tabel
              </TabsTrigger>
              <TabsTrigger value="mermaid" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 flex items-center gap-1">
                <Workflow className="h-3.5 w-3.5" />
                Diagram
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Tips Audit
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-1">
              <TabsContent value="links" className="m-0 focus-visible:outline-none">
                {renderSection(linkItems)}
              </TabsContent>
              <TabsContent value="typography" className="m-0 focus-visible:outline-none">
                {renderSection(typographyItems)}
              </TabsContent>
              <TabsContent value="lists" className="m-0 focus-visible:outline-none">
                {renderSection(listAndTableItems)}
              </TabsContent>
              <TabsContent value="mermaid" className="m-0 focus-visible:outline-none">
                {renderSection(mermaidItems)}
              </TabsContent>
              <TabsContent value="tips" className="m-0 focus-visible:outline-none">
                {renderSection(auditTips)}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="shrink-0 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span>💡 <strong>Tips:</strong> Klik</span>
            <code className="bg-zinc-800 px-1 rounded text-zinc-300">Salin</code>
            <span>atau</span>
            <code className="bg-zinc-800 px-1 rounded text-zinc-300">Sisipkan ke Editor</code>
            <span>untuk mencoba.</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Tutup Panduan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
