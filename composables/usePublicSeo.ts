import { SITE_URL } from '~/shared/landing'

// Upgrade 12 — título, descrição, endereço canónico e indexação das páginas
// públicas (login, ajuda, textos legais). As páginas utilitárias (recuperar a
// password, formulário de contacto) ficam fora das pesquisas (`noindex`).
export function usePublicSeo(opts: { title: () => string; path: string; description?: () => string; noindex?: boolean }) {
  const { t } = useI18n()
  const description = opts.description || (() => t('meta.description'))
  const title = () => `${opts.title()} · FinanceFlow`
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `${SITE_URL}${opts.path}`,
    robots: opts.noindex ? 'noindex, follow' : 'index, follow',
  })
  useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}${opts.path}` }] })
}
