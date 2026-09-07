'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Cpu, Check, Copy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export interface McpSetupDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const DEFAULT_MCP_CONFIG = JSON.stringify(
  {
    mcpServers: {
      markforge: {
        command: 'bun',
        args: ['run', '/path/to/markforge/packages/mcp/src/index.ts'],
      },
    },
  },
  null,
  2
);

export function McpSetupDialog({
  open,
  onOpenChange,
  trigger,
}: McpSetupDialogProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = () => {
    navigator.clipboard.writeText(DEFAULT_MCP_CONFIG);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <DialogContent className="max-w-md sm:max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
          <Cpu className="h-5 w-5 text-purple-400" />
          {t?.('header.mcpTitle') || 'Model Context Protocol (MCP) Setup'}
        </DialogTitle>
        <DialogDescription className="text-xs text-zinc-400">
          {t?.('header.mcpDesc') ||
            'Connect MarkForge directly into Claude Desktop, Cursor, or Antigravity to convert documents and analyze ATS scores via AI prompts.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 pt-2">
        <p className="text-xs text-zinc-300">
          Add this block to your{' '}
          <code className="bg-zinc-800 px-1 py-0.5 rounded text-emerald-400">
            claude_desktop_config.json
          </code>{' '}
          or cursor config:
        </p>
        <div className="relative rounded-md bg-zinc-950 p-3 font-mono text-xs text-zinc-300 border border-zinc-800 overflow-x-auto">
          <pre>{DEFAULT_MCP_CONFIG}</pre>
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 h-7 px-2 text-xs"
            onClick={handleCopy}
            title={copied ? (t?.('common.copied') || 'Copied!') : (t?.('common.copy') || 'Copy')}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <div className="rounded bg-purple-950/30 border border-purple-800/40 p-2.5 text-xs text-purple-200">
          ⚡ <strong>{t?.('header.mcpToolsIncluded') || 'AI Tools Included:'}</strong>{' '}
          <code>convert_markdown</code>, <code>analyze_document</code>,{' '}
          <code>list_templates</code>, and <code>doctor</code>.
        </div>
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}
