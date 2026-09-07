import { ATSReport, ATSSectionCheck } from './types';
import { parseMarkdownToAST } from './parser';

const POWER_ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'analyzed', 'architected',
  'automated', 'boosted', 'built', 'centralized', 'championed',
  'collaborated', 'consolidated', 'constructed', 'converted', 'cut',
  'decreased', 'delivered', 'deployed', 'designed', 'developed',
  'devised', 'doubled', 'drove', 'engineered', 'enhanced',
  'established', 'executed', 'expanded', 'expedited', 'facilitated',
  'formulated', 'generated', 'governed', 'guided', 'implemented',
  'improved', 'increased', 'initiated', 'innovated', 'installed',
  'instituted', 'integrated', 'introduced', 'invented', 'launched',
  'lead', 'led', 'maintained', 'managed', 'maximized',
  'mentored', 'migrated', 'minimized', 'modernized', 'negotiated',
  'orchestrated', 'overhauled', 'oversaw', 'partnered', 'pioneered',
  'planned', 'produced', 'programmed', 'projected', 'published',
  'rebuilt', 'recruited', 'redesigned', 'reduced', 'refactored',
  'remodeled', 'reorganized', 'replaced', 'resolved', 'restructured',
  'revamped', 'revitalized', 'saved', 'scaled', 'scheduled',
  'secured', 'simplified', 'slashed', 'solved', 'spearheaded',
  'standardized', 'streamlined', 'strengthened', 'supervised', 'surpassed',
  'tested', 'trained', 'transformed', 'troubleshot', 'unified',
  'upgraded', 'validated', 'yielded'
];

const STANDARD_SECTIONS = [
  { name: 'Summary / Profile', regex: /(summary|profile|about\s*me|objective)/i, weight: 15 },
  { name: 'Work Experience', regex: /(experience|employment|work\s*history|career)/i, weight: 30 },
  { name: 'Education', regex: /(education|academic|qualifications|degrees)/i, weight: 15 },
  { name: 'Skills', regex: /(skills|competencies|technical\s*skills|tech\s*stack)/i, weight: 20 },
  { name: 'Projects / Achievements', regex: /(projects|portfolio|achievements|certifications)/i, weight: 10 },
];

export function analyzeMarkdownDocument(markdown: string): ATSReport {
  const nodes = parseMarkdownToAST(markdown);
  const textContent = markdown.replace(/[#*`_\[\]()\-+|]/g, ' ');
  const words = textContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Find Action Verbs
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ''));
  const foundVerbsSet = new Set<string>();
  for (const w of lowerWords) {
    if (POWER_ACTION_VERBS.includes(w)) {
      foundVerbsSet.add(w);
    }
  }
  const actionVerbsFound = Array.from(foundVerbsSet);
  const actionVerbsCount = actionVerbsFound.length;

  // Quantified metrics (e.g. 25%, $50K, 10x, 500ms, 99.9%, 10,000)
  const metricRegex = /(\b\d+([.,]\d+)?\s*(%|\$|x|ms|s|k|m|users|requests|req\/s|tps|clients|pts)?\b|\$\d+)/gi;
  const metricsMatches = markdown.match(metricRegex) || [];
  const quantifiedMetricsCount = metricsMatches.length;

  // Section checks
  const h2Headers = nodes
    .filter((n) => n.type === 'h2')
    .map((n) => (n.text || '').toLowerCase());

  const sectionResults: ATSSectionCheck[] = STANDARD_SECTIONS.map((sec) => {
    const found = h2Headers.some((h) => sec.regex.test(h));
    return {
      section: sec.name,
      found,
      weight: sec.weight,
    };
  });

  // Calculate score
  let score = 0;

  // 1. Sections score (up to 90 points based on weights)
  for (const sec of sectionResults) {
    if (sec.found) score += sec.weight;
  }

  // 2. Contact details check (up to 10 points)
  let contactScore = 0;
  if (/@/.test(markdown)) contactScore += 3;
  if (/linkedin\.com/i.test(markdown)) contactScore += 3;
  if (/github\.com|portfolio/i.test(markdown)) contactScore += 2;
  if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(markdown)) contactScore += 2;
  score += Math.min(10, contactScore);

  // Bonus / deductions
  if (actionVerbsCount >= 8) score += 5;
  else if (actionVerbsCount < 3) score -= 5;

  if (quantifiedMetricsCount >= 6) score += 5;
  else if (quantifiedMetricsCount === 0) score -= 8;

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine Grade
  let grade: ATSReport['grade'] = 'C';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else grade = 'D';

  // Warnings and suggestions
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const missingSections = sectionResults.filter((s) => !s.found);
  if (missingSections.length > 0) {
    warnings.push(
      `Missing recommended standard sections: ${missingSections.map((s) => s.section).join(', ')}`
    );
  }

  if (actionVerbsCount < 5) {
    suggestions.push(
      'Incorporate more high-impact action verbs (e.g. Engineered, Spearheaded, Automated, Delivered) in experience bullets.'
    );
  }

  if (quantifiedMetricsCount < 4) {
    suggestions.push(
      'Add quantifiable accomplishments and metrics (e.g., "Increased performance by 42%", "Saved $15k/mo", "Handled 1M+ req/day").'
    );
  }

  if (!/@/.test(markdown)) {
    warnings.push('No email address detected. Contact information is critical for ATS parsing.');
  }

  // Check long bullets
  const longBullets = nodes.filter(
    (n) => n.type === 'bullet' && (n.text || '').split(/\s+/).length > 40
  );
  if (longBullets.length > 0) {
    suggestions.push(
      `${longBullets.length} bullet point(s) exceed 40 words. Keep bullet points punchy and concise (15-30 words) for readability.`
    );
  }

  return {
    score,
    grade,
    wordCount,
    readingTimeMinutes,
    actionVerbsCount,
    actionVerbsFound,
    quantifiedMetricsCount,
    sections: sectionResults,
    warnings,
    suggestions,
  };
}
