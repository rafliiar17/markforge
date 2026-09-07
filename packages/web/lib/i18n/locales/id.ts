import type { TranslationSchema } from '../types';

export const idTranslations: TranslationSchema = {
  common: {
    appTitle: 'MarkForge',
    tagLine: 'Engine Kompilasi Markdown ke Dokumen Profesional',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    copy: 'Salin',
    copied: 'Tersalin!',
    download: 'Unduh',
    loading: 'Memuat...',
    error: 'Terjadi Kesalahan',
    success: 'Berhasil',
    delete: 'Hapus',
    edit: 'Ubah',
    back: 'Kembali',
    next: 'Lanjut',
    confirm: 'Konfirmasi',
    version: 'v1.0.0 Open Source',
  },
  header: {
    docType: 'Tipe Dokumen',
    templateStyle: 'Gaya Templat',
    exportDocx: 'Ekspor DOCX',
    exportPdf: 'Ekspor PDF',
    printBrowser: 'Cetak / PDF Browser',
    compiling: 'Mengompilasi...',
    mcpServer: 'Server MCP',
    syntaxGuide: 'Panduan Sintaks',
    langSwitch: 'Ganti Bahasa',
    standardTypes: 'Tipe Standar',
    customTypesGroup: 'Tipe Kustom ({count})',
    addCustomType: '+ Tambah Tipe Kustom...',
    recommendedStyles: '⭐ Disarankan untuk {type}',
    allStyles: '🌐 Semua Gaya Tersedia',
    otherStyles: '🌐 Gaya Lainnya',
    exportPdfTooltip: 'Ekspor PDF 1:1 via Server Engine (LibreOffice / Weasyprint)',
    printBrowserTooltip: 'Cetak langsung ke printer atau simpan sebagai PDF via Browser',
    mcpTitle: 'Pengaturan Model Context Protocol (MCP)',
    mcpDesc:
      'Hubungkan MarkForge langsung ke Claude Desktop, Cursor, atau Antigravity untuk konversi dokumen dan audit ATS lewat prompt AI.',
    mcpToolsIncluded: 'Alat AI Termasuk:',
  },
  editor: {
    sourceTitle: 'SUMBER MARKDOWN',
    dropzoneHint: 'Tarik & lepas berkas .md atau .txt di sini',
    formatGuide: 'Panduan Format',
    mermaidFlow: 'Diagram Alur Mermaid',
    analyzeAts: 'Audit ATS',
    analyzePortfolio: 'Audit Portofolio',
    analyzeSpec: 'Audit Spesifikasi',
    analyzing: 'Menganalisis...',
    wordsCount: '{count} kata',
    placeholder: 'Ketik atau tempel dokumen markdown Anda di sini...',
  },
  tabs: {
    documentPreview: 'Pratinjau Dokumen',
    auditScorecard: 'Kartu Skor Audit',
    rawOutput: 'Keluaran Mentah',
    parityBadge: 'Kanvas A4 Paritas 1:1',
  },
  audit: {
    scoreLabel: 'AUDIT KEPATUHAN DOKUMEN',
    gradeLabel: 'Peringkat',
    metrics: {
      words: 'Kata',
      readingTime: 'Waktu Baca',
      links: 'Tautan',
      diagrams: 'Diagram',
      metricPoints: 'Poin Metrik',
      actionVerbs: 'Kata Kerja Aksi',
      quantified: 'Kuantitatif',
    },
    checklistTitle: 'Daftar Periksa Persyaratan & Standar',
    passed: 'Lolos',
    failed: 'Perlu Perbaikan',
    recommendationsTitle: 'Saran untuk Menyempurnakan Dokumen',
    scoreSummaryExcellent:
      'Luar biasa! Dokumen memenuhi seluruh standar komprehensif dan konvensi industri.',
    scoreSummaryGood:
      'Pondasi baik. Memperbaiki catatan periksa akan meningkatkan daya tarik dokumen secara signifikan.',
    scoreSummaryNeedsWork:
      'Perlu penyempurnaan. Bagian penting atau elemen yang direkomendasikan belum ditemukan.',
    pts: '+{weight} poin',
    found: 'Ditemukan',
    missing: 'Belum Ada',
  },
  switchDialog: {
    title: 'Ganti Tipe Dokumen',
    currentDoc: 'Tipe Saat Ini',
    targetDoc: 'Target Baru',
    loadStarter: 'Muat Contoh {target}',
    keepText: 'Pertahankan Teks Saat Ini',
    cancel: 'Batal',
    description:
      'Pilih apakah Anda ingin memuat contoh starter markdown untuk tipe baru atau mempertahankan konten teks Anda saat ini.',
    tip: 'Tips: Memilih "Muat Contoh" akan menimpa editor dengan starter template resmi tipe ini. Memilih "Pertahankan Teks" akan mempertahankan seluruh isi dokumen Anda sembari memperbarui aturan audit & styling.',
  },
  customTypeModal: {
    title: 'Kelola Tipe Dokumen Kustom',
    subtitle:
      'Definisikan tipe dokumen kustom dengan aturan audit, templat bawaan, dan starter Markdown Anda sendiri.',
    formLabels: {
      name: 'Nama Tipe Dokumen',
      category: 'Kategori',
      description: 'Deskripsi Ringkas',
      defaultTemplate: 'Templat Bawaan',
      starterMarkdown: 'Starter Markdown Bawaan',
      requiredHeadings: 'Heading Wajib (pisahkan dengan koma)',
      detectLinks: 'Deteksi Kelengkapan Tautan',
      detectDiagrams: 'Deteksi Diagram (Mermaid / Flowchart)',
      detectMetrics: 'Deteksi Metrik Kuantitatif & Angka',
    },
    addHeading: 'Tambah Heading',
    detectLinks: 'Wajibkan minimal satu hyperlink eksternal',
    detectDiagrams: 'Wajibkan minimal satu diagram arsitektur Mermaid',
    exportJson: 'Ekspor JSON',
    importJson: 'Impor JSON',
    saveType: 'Simpan Tipe Dokumen',
    cancel: 'Batal',
    deleteType: 'Hapus Tipe',
    successCreated: 'Tipe dokumen berhasil dibuat',
    successUpdated: 'Tipe dokumen berhasil diperbarui',
    validationError: 'Nama tipe dokumen tidak boleh kosong',
  },
  cheatsheet: {
    title: 'Panduan Sintaks Markdown & Panduan Format',
    subtitle:
      'Pelajari cara memformat resume, portofolio, dan spesifikasi teknis untuk hasil ekspor PDF & DOCX yang presisi.',
    tabs: {
      links: 'Tautan & Kontak',
      typography: 'Tipografi & Heading',
      lists: 'Daftar & Tabel',
      mermaid: 'Diagram Mermaid',
      tips: 'Tips Skor ATS',
    },
    copy: 'Salin Sintaks',
    copied: 'Tersalin!',
    insertToEditor: 'Sisipkan ke Editor',
    tipFooter:
      'Semua sintaks di atas otomatis dikonversi menjadi elemen Word DOCX dan PDF beresolusi tinggi dengan tipografi A4 presisi.',
  },
  starters: {
    cv: `# Rafli Arraafi Albaasith
*Senior Full Stack & Cloud Platform Engineer*
Jakarta, ID • rafli@example.com • +62 812-3456-7890 • linkedin.com/in/rafliiarz • github.com/rafliiarz • rafli.dev

## Ringkasan Profesional
Software Engineer berpengalaman lebih dari 6 tahun dalam merancang dan mengelola arsitektur cloud terdistribusi dengan throughput tinggi yang melayani lebih dari 10 juta pengguna aktif bulanan. Berpengalaman mendalam dalam optimasi latensi backend, sistem microservices berbasis event-driven, serta modernisasi pipeline CI/CD yang menghemat biaya infrastruktur hingga Rp 450 juta per tahun.

## Pengalaman Kerja
### Staff Software Engineer | PT Inovasi Teknologi Terbuka
*2022 - Sekarang | Jakarta, Indonesia*
- Merancang dan memimpin arsitektur platform streaming multi-region menggunakan Go, Kafka, dan Redis yang memproses 1,5 juta pesan/detik dengan ketersediaan 99,999%.
- Mengoptimasi lapisan caching query database PostgreSQL, memangkas latensi p99 hingga 45% (dari 320ms menjadi 42ms).
- Mengorkestrasi migrasi jaringan zero-trust di lebih dari 120 microservices Kubernetes tanpa downtime.
- Mementori 10 senior dan mid-level software engineer dalam best practices arsitektur cloud dan TDD.

### Senior Backend Engineer | PT Solusi Digital Mandiri
*2019 - 2022 | Bandung, Indonesia*
- Membangun automated CI/CD validation pipeline, memangkas siklus rilis produksi dari 2 minggu menjadi 25 menit.
- Mengotomatisasi skrip migrasi dan indexing database yang menghemat sekitar 12 jam kerja tim developer setiap minggunya.
- Merancang gateway gRPC berkinerja tinggi yang menangani 12.000 permintaan/detik dengan latensi sub-10ms.

## Pendidikan
### S1 Teknik Informatika | Institut Teknologi Bandung
*2015 - 2019 | IPK: 3.82 / 4.00*

## Keahlian Teknis
- **Bahasa Pemrograman:** TypeScript, Go, Rust, Python, SQL, Java
- **Cloud & DevOps:** Kubernetes, Docker, AWS, Google Cloud, Cloudflare Workers, Terraform, Prometheus
- **Database & Antrean:** PostgreSQL, Redis, Apache Kafka, ClickHouse, SQLite

## Proyek Unggulan
### MarkForge Document Engine
- Penulis utama dan maintainer engine kompilasi markdown-ke-dokumen universal berbasis open-source dengan dukungan ATS scoring dan integrasi Model Context Protocol (MCP).
`,
    portfolio: `# Portofolio: Rafli Arraafi Albaasith
*Full Stack Engineer & Cloud Systems Architect*
Jakarta, Indonesia • contact@rafli.dev • github.com/rafliiarz • rafli.dev

## Tentang Saya
Software Architect dengan pengalaman membangun aplikasi web skala besar dan infrastruktur cloud yang tangguh. Terbiasa memimpin inisiatif dari konsep arsitektur hingga deployment produksi dengan fokus kuat pada performa tinggi, efisiensi resource, dan pengalaman pengguna yang mulus.

## Arsitektur Sistem Unggulan
\`\`\`mermaid
graph TD
  User[Klien / Web Browser] --> Cloudflare[Cloudflare Edge / CDN]
  Cloudflare --> Gateway[API Gateway Go]
  Gateway --> Auth[Service Autentikasi]
  Gateway --> Core[Core Engine Service]
  Core --> Cache[(Redis Cluster)]
  Core --> DB[(PostgreSQL Primary)]
  Core --> Queue[Kafka Event Bus]
  Queue --> Worker[Async Background Workers]
\`\`\`

## Proyek Pilihan
### 1. MarkForge Studio
- **Teknologi:** Next.js 15, TypeScript, Tailwind CSS, Bun, WebAssembly
- Engine konversi Markdown ke PDF dan DOCX dengan paritas 1:1 dan validasi kepatuhan format secara instan.
- Mendukung integrasi MCP Server untuk alur kerja agentic coding.

### 2. Distributed Telemetry Pipeline
- **Teknologi:** Go, OpenTelemetry, ClickHouse, Kafka, Docker
- Platform penangkap log dan metrik berkecepatan tinggi yang mampu menangani 250.000 event/detik dengan retensi data 90 hari terkompresi.

## Keterampilan Inti & Tech Stack
- **Frontend:** React 19, Next.js, TypeScript, Tailwind CSS
- **Backend & Distributed Systems:** Go, Node.js, Rust, gRPC, RESTful APIs
- **Infrastruktur:** Kubernetes, Docker, Terraform, Cloudflare Workers, AWS
- **Database:** PostgreSQL, Redis, ClickHouse, SQLite

## Kontak & Tautan
- **Website:** [rafli.dev](https://rafli.dev)
- **GitHub:** [github.com/rafliiarz](https://github.com/rafliiarz)
- **LinkedIn:** [linkedin.com/in/rafliiarz](https://linkedin.com/in/rafliiarz)
- **Email:** [contact@rafli.dev](mailto:contact@rafli.dev)
`,
  },
};
