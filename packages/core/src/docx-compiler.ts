import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  UnderlineType,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from 'docx';
import { CompileOptions, TemplateStyleConfig } from './types';
import { getTemplate } from './templates';
import { parseMarkdownToAST, parseInlineSpans, InlineSpan } from './parser';
import { createLogger } from './logger';
import { withSpan } from './otel';

const logger = createLogger('markforge:docx');

function createRunsFromSpans(
  spans: InlineSpan[],
  baseSize: number,
  font: string,
  defaultColor: string,
  accentColor: string
): (TextRun | ExternalHyperlink)[] {
  return spans.map((span) => {
    if (span.type === 'link' && span.url) {
      return new ExternalHyperlink({
        link: span.url,
        children: [
          new TextRun({
            text: span.text,
            color: accentColor,
            underline: { type: UnderlineType.SINGLE },
            size: baseSize,
            font,
          }),
        ],
      });
    }

    if (span.type === 'code') {
      return new TextRun({
        text: ` ${span.text} `,
        font: 'Consolas',
        size: Math.max(14, baseSize - 2),
        color: '334155',
        shading: {
          type: ShadingType.CLEAR,
          fill: 'F1F5F9',
        },
      });
    }

    return new TextRun({
      text: span.text,
      bold: span.type === 'bold',
      italics: span.type === 'italic',
      size: baseSize,
      font,
      color: defaultColor,
    });
  });
}

export async function compileMarkdownToDocx(
  markdown: string,
  options: CompileOptions = {}
): Promise<Buffer> {
  return await withSpan(
    'markforge.compile_docx',
    {
      'markforge.template': options.template || 'ats-classic',
      'markforge.paper_size': options.paperSize || 'A4',
      'markforge.document_title': options.title || 'Document',
      'markforge.content_length': markdown.length,
    },
    async (span) => {
      logger.debug({ template: options.template }, 'Starting OpenXML DOCX assembly');

      const templateDef = getTemplate(options.template);
      const style: TemplateStyleConfig = {
        ...templateDef.style,
        ...(options.customStyle || {}),
      };

      const nodes = parseMarkdownToAST(markdown);
      span.setAttribute('markforge.ast_node_count', nodes.length);

      const children: (Paragraph | Table)[] = [];

      const isA4 = (options.paperSize || 'A4').toUpperCase() === 'A4';
      const pageSize = isA4
        ? { width: 11906, height: 16838 }
        : { width: 12240, height: 15840 };

      for (const node of nodes) {
        switch (node.type) {
          case 'h1': {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: node.text || '',
                    bold: true,
                    size: 50,
                    font: style.fontHeading || style.fontPrimary,
                    color: style.headingColor,
                  }),
                ],
                alignment:
                  templateDef.category === 'resume'
                    ? AlignmentType.CENTER
                    : AlignmentType.LEFT,
                spacing: { before: 100, after: 30 },
              })
            );
            break;
          }

          case 'subtitle': {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: node.text || '',
                    italics: true,
                    size: 22,
                    font: style.fontPrimary,
                    color: '4B5563',
                  }),
                ],
                alignment:
                  templateDef.category === 'resume'
                    ? AlignmentType.CENTER
                    : AlignmentType.LEFT,
                spacing: { before: 0, after: 40 },
              })
            );
            break;
          }

          case 'contact_bar': {
            const spans = parseInlineSpans(node.text || '');
            const runs = createRunsFromSpans(
              spans,
              19,
              style.fontPrimary,
              '374151',
              style.accentColor
            );

            children.push(
              new Paragraph({
                children: runs,
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 100 },
                border: {
                  bottom: {
                    color: style.borderColor,
                    size: 4,
                    style: BorderStyle.SINGLE,
                  },
                },
              })
            );
            break;
          }

          case 'h2': {
            const isResume = templateDef.category === 'resume';
            const titleText = isResume
              ? (node.text || '').toUpperCase()
              : node.text || '';

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: titleText,
                    bold: true,
                    size: 22,
                    font: style.fontHeading || style.fontPrimary,
                    color: style.headingColor,
                  }),
                ],
                spacing: { before: 180, after: 60 },
                border: {
                  bottom: {
                    color: style.borderColor,
                    size: 6,
                    style: BorderStyle.SINGLE,
                  },
                },
              })
            );
            break;
          }

          case 'h3': {
            const spans = parseInlineSpans(node.text || '');
            const runs = createRunsFromSpans(
              spans,
              20,
              style.fontHeading || style.fontPrimary,
              style.textColor,
              style.accentColor
            );
            children.push(
              new Paragraph({
                children: runs,
                spacing: { before: 120, after: 20 },
              })
            );
            break;
          }

          case 'h4': {
            const spans = parseInlineSpans(node.text || '');
            const runs = createRunsFromSpans(
              spans,
              19,
              style.fontPrimary,
              style.textColor,
              style.accentColor
            );
            children.push(
              new Paragraph({
                children: runs,
                spacing: { before: 80, after: 20 },
              })
            );
            break;
          }

          case 'bullet': {
            const spans = parseInlineSpans(node.text || '');
            const runs = createRunsFromSpans(
              spans,
              20,
              style.fontPrimary,
              style.textColor,
              style.accentColor
            );
            children.push(
              new Paragraph({
                children: runs,
                bullet: { level: node.level || 0 },
                spacing: { after: 25 },
              })
            );
            break;
          }

          case 'code_block': {
            const isMermaid = node.language?.trim().toLowerCase() === 'mermaid';
            const codeLines = (node.text || '').split('\n');

            if (isMermaid) {
              const accentColor = (style.accentColor || '0D9488').replace(/^#/, '');
              const borderColor = (style.borderColor || 'CBD5E1').replace(/^#/, '');
              const calloutParagraphs: Paragraph[] = [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '[Mermaid Flowchart]',
                      bold: true,
                      size: 16,
                      font: style.fontCode || 'Consolas',
                      color: accentColor,
                    }),
                  ],
                  spacing: { before: 40, after: 60 },
                }),
                ...codeLines.map(
                  (cl) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cl || ' ',
                          font: style.fontCode || 'Consolas',
                          size: 17,
                          color: '1E293B',
                        }),
                      ],
                      spacing: { after: 0, line: 220 },
                    })
                ),
              ];

              children.push(
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: {
                            left: {
                              style: BorderStyle.SINGLE,
                              size: 16,
                              color: accentColor,
                            },
                            top: {
                              style: BorderStyle.SINGLE,
                              size: 4,
                              color: borderColor,
                            },
                            right: {
                              style: BorderStyle.SINGLE,
                              size: 4,
                              color: borderColor,
                            },
                            bottom: {
                              style: BorderStyle.SINGLE,
                              size: 4,
                              color: borderColor,
                            },
                          },
                          shading: {
                            type: ShadingType.CLEAR,
                            fill: 'F8FAFC',
                          },
                          margins: {
                            top: 100,
                            bottom: 100,
                            left: 150,
                            right: 150,
                          },
                          children: calloutParagraphs,
                        }),
                      ],
                    }),
                  ],
                  width: { size: 100, type: WidthType.PERCENTAGE },
                })
              );

              children.push(
                new Paragraph({
                  spacing: { after: 80 },
                })
              );
            } else {
              for (const cl of codeLines) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cl || ' ',
                        font: style.fontCode || 'Consolas',
                        size: 18,
                        color: '0F172A',
                      }),
                    ],
                    shading: {
                      type: ShadingType.CLEAR,
                      fill: 'F8FAFC',
                    },
                    spacing: { after: 0, line: 220 },
                  })
                );
              }
            }
            break;
          }

          case 'quote': {
            const spans = parseInlineSpans(node.text || '');
            const runs = createRunsFromSpans(
              spans,
              20,
              style.fontPrimary,
              '475569',
              style.accentColor
            );
            children.push(
              new Paragraph({
                children: runs,
                border: {
                  left: {
                    color: style.accentColor,
                    size: 12,
                    style: BorderStyle.SINGLE,
                  },
                },
                spacing: { before: 80, after: 80 },
              })
            );
            break;
          }

          case 'table': {
            if (node.tableRows && node.tableRows.length > 0) {
              const rows = node.tableRows.map((r, rowIndex) => {
                const isHeader = rowIndex === 0;
                return new TableRow({
                  children: r.map((cellText) => {
                    const cellSpans = parseInlineSpans(cellText);
                    const cellRuns = createRunsFromSpans(
                      cellSpans,
                      19,
                      style.fontPrimary,
                      isHeader ? 'FFFFFF' : style.textColor,
                      style.accentColor
                    );
                    return new TableCell({
                      children: [
                        new Paragraph({
                          children: cellRuns,
                          spacing: { before: 40, after: 40 },
                        }),
                      ],
                      shading: isHeader
                        ? {
                            type: ShadingType.CLEAR,
                            fill: style.headingColor,
                          }
                        : undefined,
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                    });
                  }),
                });
              });

              children.push(
                new Table({
                  rows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                })
              );
            }
            break;
          }

          case 'horizontal_rule': {
            children.push(
              new Paragraph({
                border: {
                  bottom: {
                    color: style.borderColor,
                    size: 4,
                    style: BorderStyle.SINGLE,
                  },
                },
                spacing: { before: 80, after: 80 },
              })
            );
            break;
          }

          case 'paragraph':
          default: {
            const spans = parseInlineSpans(node.text || '');
            const runs = createRunsFromSpans(
              spans,
              20,
              style.fontPrimary,
              style.textColor,
              style.accentColor
            );
            children.push(
              new Paragraph({
                children: runs,
                spacing: { after: 45 },
              })
            );
            break;
          }
        }
      }

      const doc = new Document({
        title: options.title || 'Document',
        creator: options.author || 'MarkForge',
        styles: {
          default: {
            document: {
              run: {
                font: style.fontPrimary,
                size: 20,
                color: style.textColor,
              },
              paragraph: {
                spacing: { line: style.lineHeight },
              },
            },
          },
        },
        sections: [
          {
            properties: {
              page: {
                size: pageSize,
                margin: style.margins,
              },
            },
            children,
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      span.setAttribute('markforge.output_bytes', buffer.length);
      logger.info({ sizeBytes: buffer.length }, 'OpenXML DOCX assembled successfully');
      return buffer;
    }
  );
}
