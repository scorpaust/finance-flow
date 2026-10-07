// Saudação do painel ("Bom dia" / "Boa tarde" / "Boa noite") a partir da hora
// LOCAL do dispositivo — nunca a do servidor (UTC no Netlify: às 02:00 em
// Lisboa o servidor estava na 01:00 e a app dizia "Bom dia"). A hora do
// telemóvel/computador já está no fuso de cada país; os escalões seguem o uso
// de cada língua. Entre a meia-noite e as 5h é sempre a saudação da noite.
export type GreetingPeriod = 'morning' | 'afternoon' | 'evening'

// [início da tarde, início da noite]
const BOUNDS: Record<string, [number, number]> = {
  'pt-PT': [12, 20], // "boa tarde" até ao anoitecer
  en: [12, 18],
  fr: [12, 18],
  de: [11, 18], // "Guten Morgen" só até ao fim da manhã; depois "Guten Tag"
  it: [13, 18], // "buongiorno" até ao almoço; "buonasera" a partir do fim da tarde
  es: [13, 21], // "buenos días" até ao almoço (tarde, em Espanha); "buenas tardes" até ~21h
}

export function greetingPeriod(hour: number, locale: string): GreetingPeriod {
  const [afternoon, evening] = BOUNDS[locale] || BOUNDS.en!
  if (hour < 5) return 'evening'
  if (hour < afternoon) return 'morning'
  if (hour < evening) return 'afternoon'
  return 'evening'
}
