import { describe, it, expect } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ErrorBoundary from '../app/error';

describe('Web Studio React Error Boundary Component', () => {
  it('should render error message and dark-mode layout gracefully', () => {
    const mockError = new Error('Database connection failed during document rendering') as Error & { digest?: string };
    const resetCalled = false;
    const mockReset = () => {};

    const html = renderToString(
      React.createElement(ErrorBoundary, {
        error: mockError,
        reset: mockReset,
      })
    );

    // Dark mode container and title
    expect(html).toContain('bg-zinc-950');
    expect(html).toContain('Terjadi Kesalahan di Web Studio');
    expect(html).toContain('Aplikasi mengalami kendala tak terduga saat memproses dokumen atau antarmuka studio.');

    // Error message display
    expect(html).toContain('Database connection failed during document rendering');
    expect(html).toContain('Pesan Kesalahan');

    // Action buttons
    expect(html).toContain('Coba Muat Ulang');
    expect(html).toContain('Kembali ke Halaman Utama');
  });

  it('should display error digest when digest ID is present', () => {
    const mockError = new Error('Unexpected token in markdown AST') as Error & { digest?: string };
    mockError.digest = 'ERR_DIGEST_98231';

    const html = renderToString(
      React.createElement(ErrorBoundary, {
        error: mockError,
        reset: () => {},
      })
    );

    expect(html).toContain('Digest ID:');
    expect(html).toContain('ERR_DIGEST_98231');
  });

  it('should handle empty or missing error message gracefully', () => {
    const mockError = new Error('') as Error & { digest?: string };

    const html = renderToString(
      React.createElement(ErrorBoundary, {
        error: mockError,
        reset: () => {},
      })
    );

    expect(html).toContain('Unknown runtime error occurred.');
    expect(html).toContain('Coba Muat Ulang');
    expect(html).toContain('Kembali ke Halaman Utama');
  });
});
