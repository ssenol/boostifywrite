// Dimension data — used by the 4 rubric detail screens.
import { colors } from '@/theme';

export type DimensionData = {
  name: string;
  level: string;
  score: number;
  color: string;
  summary: string;
  strengths: string[];
  workOn: string[];
  quoteBad: string;
  quoteTry: string;
  practice: string[];
};

export const D_TASK: DimensionData = {
  name: 'Task Achievement', level: 'B1+', score: 6.5, color: colors.rubricTask,
  summary: 'You addressed both sides and gave an opinion, but your position in the conclusion is weak.',
  strengths: ['Both views discussed (pro & con)', 'Personal opinion in conclusion', 'Ideas relevant to prompt'],
  workOn: ['Hedged position ("it depends")', 'Counter-view in ¶3 underdeveloped'],
  quoteBad: 'In my opinion, social media is a tool and it depends how we use it.',
  quoteTry: 'While social media carries real risks, I believe its benefits decisively outweigh them when used in moderation.',
  practice: ['Rewrite your conclusion with a stronger stance', 'Extend ¶3 with one more example'],
};

export const D_COHESION: DimensionData = {
  name: 'Coherence & Cohesion', level: 'B1+', score: 6, color: colors.rubricCohesion,
  summary: 'Structure is clear, but linkers are mostly A2-level. Upgrading connectors lifts your score fast.',
  strengths: ['Classic 4-paragraph structure', 'Paragraph openers signpost clearly', 'Each paragraph has one main idea'],
  workOn: ['Over-reliance on basic linkers ("Also", "And")', 'No pronoun referencing within paragraphs'],
  quoteBad: 'Also we can meet new people from different country.',
  quoteTry: 'Furthermore, / In addition, / What is more,',
  practice: ['Replace every "Also" with a B1 linker', 'Add one reference chain (social media → this platform)'],
};

export const D_LEXICAL: DimensionData = {
  name: 'Lexical Range', level: 'B1', score: 5.5, color: colors.rubricLexical,
  summary: 'You\'re stuck on basic intensifiers. Swapping "very + adjective" pairs for single B1 adjectives is the quickest win.',
  strengths: ['Some topic-specific vocabulary used', 'Correct use of "keep in touch"'],
  workOn: ['Heavy use of "very"', 'No collocations', 'Plural errors ("peoples", "country")'],
  quoteBad: 'This is very good for practising English.',
  quoteTry: 'This is invaluable / remarkably effective for practising English.',
  practice: ['Replace every "very + adj" with a single B1 adjective', 'Use 2 collocations from your vocab list'],
};

export const D_GRAMMAR: DimensionData = {
  name: 'Grammatical Accuracy', level: 'B1', score: 5, color: colors.rubricGrammar,
  summary: '7 grammar errors across subject-verb agreement, articles, and plurals. Each one costs a band point.',
  strengths: ['Complex sentences attempted', 'Modal verbs used correctly ("can", "should")'],
  workOn: ['5 subject–verb agreement errors', 'Missing articles ("In modern world" → "In THE modern world")', 'Incomplete verb forms ("They scrolling")'],
  quoteBad: 'They scrolling for hours because of tourism.',
  quoteTry: 'They scroll / They are scrolling for hours because of tourism.',
  practice: ['Fix the 7 highlighted errors in your essay', 'Do a 5-min article drill'],
};
