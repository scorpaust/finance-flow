// Upgrade 08 — perguntas frequentes da página de ajuda, nas 6 línguas (um
// ficheiro por língua em utils/help/). Os `id` das secções e das perguntas são
// os mesmos em todas as línguas: as ligações "?" da app apontam para eles
// (`/help#<id>`). Estrutura igual nas 6 línguas — tests/helpContent.test.ts.
import type { AppLocale } from '~/shared/locale'
import { helpPt } from './help/pt-PT'
import { helpEn } from './help/en'
import { helpFr } from './help/fr'
import { helpDe } from './help/de'
import { helpIt } from './help/it'
import { helpEs } from './help/es'

export interface HelpItem {
  id: string
  q: string
  a: string
}

export interface HelpSection {
  id: string
  title: string
  items: HelpItem[]
}

export const HELP_CONTENT: Record<AppLocale, HelpSection[]> = {
  'pt-PT': helpPt,
  en: helpEn,
  fr: helpFr,
  de: helpDe,
  it: helpIt,
  es: helpEs,
}

// Perguntas para onde a app aponta com o ícone "?" (HelpLink).
export const HELP_TOPICS = ['groups', 'ai-budget', 'forecast-how', 'ai-data', 'investment-tips'] as const
export type HelpTopic = (typeof HELP_TOPICS)[number]
