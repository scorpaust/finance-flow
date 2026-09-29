// Fase 8, ponto 9 — política de privacidade e termos de serviço.
//
// Publicado a pedido explícito do utilizador em 2026-09-27, sem revisão por
// um jurista — nomeadamente a cláusula de limitação de responsabilidade
// (Termos, ponto 7), que cita o DL 446/85 num sentido que pode estar
// invertido (essa lei é mais conhecida por proibir cláusulas deste tipo em
// contratos de consumo do que por as autorizar). Reverter para true a
// qualquer momento volta a mostrar o aviso de rascunho nas páginas.
export const LEGAL_IS_DRAFT = false;
export const LEGAL_UPDATED = "2026-09-27";

export type LegalDocKey = "privacy" | "terms";
export interface LegalSection {
  h: string;
  p: string[];
}
export interface LegalDoc {
  title: string;
  sections: LegalSection[];
}

// Só PT-PT e EN estão escritos; os outros idiomas mostram EN (nota na página).
type Content = Record<LegalDocKey, { "pt-PT": LegalDoc; en: LegalDoc }>;

export const LEGAL_CONTENT: Content = {
  privacy: {
    "pt-PT": {
      title: "Política de Privacidade",
      sections: [
        {
          h: "1. Quem é o responsável pelo tratamento",
          p: [
            "O responsável pelo tratamento dos teus dados é Dinis Miguel da Silva Costa, NIF: 176280340. Para qualquer questão sobre privacidade: dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Que dados tratamos",
          p: [
            "Conta: nome, email e um hash da tua password (nunca guardamos a password em texto). Se ativares a autenticação de dois fatores, guardamos o segredo do autenticador encriptado e apenas hashes dos códigos de recuperação.",
            "Dados financeiros que tu introduzes: transações, categorias, grupos e orçamentos, e o registo de investimentos. Se preencheres o questionário de perfil de investidor, guardamos as respostas.",
            "Subscrição: o plano, o estado e as referências do pagamento. Os dados de cartão, IBAN ou telemóvel MB WAY são recolhidos diretamente pela EasyPay e nunca passam pelos nossos servidores.",
            "Preferências: idioma da interface e, no Android, se ativaste o bloqueio por biometria (guardado apenas no teu telemóvel; a app nunca recebe a tua impressão digital ou rosto).",
            "Dados técnicos: o teu endereço IP é usado para deduzir o país (com uma base de dados local, sem o enviar a terceiros) e para limitar tentativas abusivas; mantemos registos de segurança (por exemplo, tentativas de início de sessão falhadas) sem passwords, códigos nem o conteúdo dos teus dados.",
          ],
        },
        {
          h: "3. Para que usamos os dados e com que fundamento",
          p: [
            "Prestar o serviço que pediste (gerir finanças, subscrições, previsões e estatísticas): execução do contrato.",
            "Segurança da conta e prevenção de abuso (limites de tentativas, registos de segurança, 2FA): interesse legítimo.",
            "Cumprir obrigações legais aplicáveis, por exemplo fiscais e de faturação: obrigação legal.",
            "Funcionalidades de inteligência artificial: só enviam dados quando as usas (ver ponto 5).",
          ],
        },
        {
          h: "4. Com quem partilhamos os dados (subcontratantes)",
          p: [
            "MongoDB Atlas — alojamento da base de dados onde ficam os teus dados.",
            "EasyPay — processamento de pagamentos (cartão, débito direto, MB WAY, Multibanco).",
            "Anthropic — fornecedor do modelo de IA usado nas funcionalidades descritas no ponto 5.",
            "Twelve Data — dados de mercado e taxas de câmbio. Só recebe símbolos de mercado e pares de moedas, nunca dados pessoais nem os teus valores.",
            "Sentry — monitorização de erros técnicos; configurada para não enviar o conteúdo dos pedidos, cookies nem cabeçalhos.",
            "Alguns destes fornecedores podem ter subprocessadores ou infraestrutura fora do Espaço Económico Europeu; nesses casos aplicam-se as salvaguardas previstas no RGPD, nomeadamente as cláusulas contratuais-tipo aprovadas pela Comissão Europeia.",
          ],
        },
        {
          h: "5. Inteligência artificial — o que é enviado",
          p: [
            "Interpretação de estatísticas (planos Pro e Premium): enviamos valores agregados (totais por mês e por categoria) e nomes de categorias — nunca as descrições das tuas transações.",
            "Dicas de investimento (plano Premium): enviamos as respostas do teu perfil de investidor, um resumo agregado das tuas finanças e o contexto de mercado do dia. Neste momento não enviamos nenhum dado do teu registo de investimentos (portfolio); se isso vier a mudar, esta política é atualizada antes.",
            "Digitalização de documentos (planos Pro e Premium): a imagem ou PDF que carregas é enviado à Anthropic para extrair os campos, é processado em memória e não é guardado por nós. Evita carregar documentos com dados pessoais que não sejam necessários (por exemplo, NIF ou morada num recibo de vencimento).",
            "O conteúdo gerado por IA é meramente informativo e pode conter erros; não constitui aconselhamento financeiro.",
          ],
        },
        {
          h: "6. Durante quanto tempo guardamos os dados",
          p: [
            "Enquanto a tua conta existir. Quando eliminas a conta (Definições → Privacidade e dados), apagamos os teus dados da base de dados. Cópias de segurança podem manter os dados até 3 anos antes de serem substituídas.",
            "Podemos conservar apenas o estritamente necessário para cumprir obrigações legais (por exemplo, registos de faturação) durante o prazo que a lei exigir.",
          ],
        },
        {
          h: "7. Os teus direitos",
          p: [
            "Acesso e portabilidade: em Definições → Privacidade e dados podes descarregar todos os teus dados em JSON.",
            "Apagamento: na mesma secção podes eliminar a tua conta e todos os dados associados. Se tiveres uma subscrição com renovação automática, ela é cancelada antes.",
            "Retificação: podes corrigir os teus dados diretamente na app. Tens ainda direito à limitação e à oposição ao tratamento; contacta-nos em dinismiguelcosta@gmail.com.",
            "Podes apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), www.cnpd.pt.",
          ],
        },
        {
          h: "8. Cookies e armazenamento local",
          p: [
            'Usamos apenas cookies estritamente necessários: "session" (mantém a tua sessão iniciada, até 30 dias), "pending_2fa" (10 minutos, só durante a verificação de dois fatores) e "financeflow_locale" (o teu idioma). Guardamos ainda a tua preferência de bloqueio biométrico no armazenamento local do telemóvel. Não usamos cookies de publicidade nem de análise de comportamento.',
          ],
        },
        {
          h: "9. Segurança",
          p: [
            "Passwords guardadas com hash (scrypt), sessões assinadas, limitação de tentativas, autenticação de dois fatores opcional, segredos de 2FA encriptados em repouso e ligações cifradas (HTTPS). Nenhum sistema é infalível; se ocorrer uma violação de dados que te afete, notificamos-te e à CNPD nos termos da lei.",
          ],
        },
        {
          h: "10. Alterações",
          p: [
            "Se alterarmos esta política de forma relevante, avisamos-te na app. Última atualização: " +
              LEGAL_UPDATED +
              ".",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      sections: [
        {
          h: "1. Who is responsible for your data",
          p: [
            "The data controller is Dinis Miguel da Silva Costa, tax ID (NIF): 176280340. For any privacy question: dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. What data we process",
          p: [
            "Account: name, email and a hash of your password (we never store the password itself). If you enable two-factor authentication we store the authenticator secret encrypted and only hashes of the recovery codes.",
            "Financial data you enter: transactions, categories, groups and budgets, and your investment records. If you complete the investor-profile questionnaire, we store your answers.",
            "Subscription: plan, status and payment references. Card, IBAN or MB WAY phone details are collected directly by EasyPay and never pass through our servers.",
            "Preferences: interface language and, on Android, whether you enabled biometric lock (stored only on your phone; the app never receives your fingerprint or face).",
            "Technical data: your IP address is used to infer your country (through a local database, without sending it to third parties) and to limit abusive attempts; we keep security logs (for example failed sign-in attempts) without passwords, codes or the content of your data.",
          ],
        },
        {
          h: "3. Why we use the data and on what legal basis",
          p: [
            "To provide the service you asked for (managing finances, subscriptions, forecasts and statistics): performance of a contract.",
            "Account security and abuse prevention (attempt limits, security logs, 2FA): legitimate interest.",
            "Complying with applicable legal obligations, such as tax and invoicing: legal obligation.",
            "Artificial-intelligence features only send data when you use them (see section 5).",
          ],
        },
        {
          h: "4. Who we share data with (processors)",
          p: [
            "MongoDB Atlas — hosting of the database that stores your data.",
            "EasyPay — payment processing (card, direct debit, MB WAY, Multibanco).",
            "Anthropic — provider of the AI model used for the features described in section 5.",
            "Twelve Data — market data and exchange rates. It only receives market symbols and currency pairs, never personal data or your amounts.",
            "Sentry — technical error monitoring, configured not to send request content, cookies or headers.",
            "Some of these providers may have subprocessors or infrastructure outside the European Economic Area; in that case the safeguards required by the GDPR apply, in particular the European Commission's Standard Contractual Clauses.",
          ],
        },
        {
          h: "5. Artificial intelligence — what is sent",
          p: [
            "Statistics insights (Pro and Premium plans): we send aggregated figures (totals per month and category) and category names — never the descriptions of your transactions.",
            "Investment tips (Premium plan): we send your investor-profile answers, an aggregated summary of your finances and the day’s market context. We do not currently send any data from your investment records (portfolio); if that changes, this policy is updated first.",
            "Document scanning (Pro and Premium plans): the image or PDF you upload is sent to Anthropic to extract the fields, processed in memory and not stored by us. Avoid uploading documents with personal data that is not needed (for example tax ID or address on a payslip).",
            "AI-generated content is for information only, may contain errors and is not financial advice.",
          ],
        },
        {
          h: "6. How long we keep the data",
          p: [
            "As long as your account exists. When you delete your account (Settings → Privacy and data) we delete your data from the database. Backups may keep the data until 3 years before being overwritten.",
            "We may retain only what is strictly necessary to meet legal obligations (for example invoicing records) for the period the law requires.",
          ],
        },
        {
          h: "7. Your rights",
          p: [
            "Access and portability: in Settings → Privacy and data you can download all your data as JSON.",
            "Erasure: in the same section you can delete your account and all associated data. If you have an auto-renewing subscription, it is cancelled first.",
            "Rectification: you can correct your data directly in the app. You also have the right to restriction and objection; contact us at dinismiguelcosta@gmail.com.",
            "You may lodge a complaint with the Portuguese data protection authority (CNPD), www.cnpd.pt, or your local authority.",
          ],
        },
        {
          h: "8. Cookies and local storage",
          p: [
            'We only use strictly necessary cookies: "session" (keeps you signed in, up to 30 days), "pending_2fa" (10 minutes, only during two-factor verification) and "financeflow_locale" (your language). We also keep your biometric-lock preference in your phone’s local storage. We do not use advertising or behavioural analytics cookies.',
          ],
        },
        {
          h: "9. Security",
          p: [
            "Passwords stored as hashes (scrypt), signed sessions, attempt limiting, optional two-factor authentication, 2FA secrets encrypted at rest and encrypted connections (HTTPS). No system is infallible; if a data breach affecting you occurs, we will notify you and the authority as required by law.",
          ],
        },
        {
          h: "10. Changes",
          p: [
            "If we make material changes to this policy we will tell you in the app. Last updated: " +
              LEGAL_UPDATED +
              ".",
          ],
        },
      ],
    },
  },
  terms: {
    "pt-PT": {
      title: "Termos de Serviço",
      sections: [
        {
          h: "1. Aceitação",
          p: [
            "Ao criar uma conta ou usar o FinanceFlow aceitas estes termos e a Política de Privacidade. O serviço é prestado por Dinis Miguel da Silva Costa, NIF: 176280340, contacto dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. O serviço",
          p: [
            "O FinanceFlow é uma aplicação de gestão de finanças pessoais (registo de transações, orçamentos, estatísticas, previsões e registo de investimentos), disponível na web e em Android.",
          ],
        },
        {
          h: "3. A tua conta",
          p: [
            "És responsável por manter a password e o autenticador em segurança e por toda a atividade na tua conta. Recomendamos ativar a autenticação de dois fatores e guardar os códigos de recuperação. Avisa-nos de imediato se suspeitares de acesso não autorizado.",
            "Deves fornecer informação verdadeira e ter capacidade legal para celebrar este contrato.",
          ],
        },
        {
          h: "4. Planos e pagamentos",
          p: [
            "Existe um plano Gratuito com limites e planos pagos (Pro e Premium) com mais funcionalidades, ao preço indicado na app no momento da subscrição. Os pagamentos são processados pela EasyPay.",
            "Cartão e débito direto: subscrição com renovação automática até a cancelares (Definições → Subscrição); mantém o acesso até ao fim do período já pago.",
            "MB WAY e Multibanco: pagamento único por um período fixo (1, 3, 6 ou 12 meses), sem renovação automática; o acesso termina no fim do período pago, a menos que voltes a pagar. Uma referência por pagar não dá acesso ao plano.",
            "Livre resolução e reembolsos: se és consumidor, podes resolver o contrato no prazo de 14 dias a contar da sua celebração, sem indicar qualquer motivo, contactando-nos em dinismiguelcosta@gmail.com. Não deduzimos qualquer valor pelo período de serviço já usado nesse prazo: reembolsamos a totalidade do valor pago, no prazo máximo de 14 dias a contar do momento em que tomarmos conhecimento da tua decisão, pelo mesmo meio de pagamento usado na compra sempre que possível. Como contrapartida do reembolso total, a tua conta é eliminada e não podes criar uma nova conta com o mesmo email nos 6 meses seguintes; este bloqueio aplica-se só a este caso, não a uma eliminação de conta noutras circunstâncias (ver ponto 8). Se o serviço não funcionar de acordo com o acordado, tens direito à reposição da conformidade e, se esta for impossível ou desproporcionada, à redução do preço ou à resolução do contrato com reembolso, nos termos da lei.",
          ],
        },
        {
          h: "5. Conteúdo gerado por IA e informação financeira",
          p: [
            "As interpretações de estatísticas, dicas de investimento, previsões e a leitura automática de documentos são geradas por sistemas automáticos, têm carácter meramente informativo e educativo e podem conter erros.",
            "Nada na app constitui aconselhamento financeiro, de investimento, fiscal ou jurídico, nem uma recomendação personalizada para comprar ou vender qualquer produto financeiro. As decisões e os riscos são teus. Revê sempre os dados extraídos de um documento antes de os guardares.",
          ],
        },
        {
          h: "6. Utilização aceitável",
          p: [
            "Não podes usar o serviço para fins ilícitos, tentar aceder a contas ou dados de outras pessoas, contornar limites e medidas de segurança, sobrecarregar o serviço ou fazer engenharia inversa para além do permitido por lei.",
          ],
        },
        {
          h: "7. Disponibilidade e limitação de responsabilidade",
          p: [
            "Esforçamo-nos por manter o serviço disponível, mas a app é fornecida \"tal como está\" e \"conforme disponível\", sem garantias expressas ou implícitas, incluindo de exatidão dos dados, funcionamento ininterrupto, ausência de erros, adequação a um fim específico ou não infração de direitos de terceiros.",
            "Não garantimos que as análises, previsões, interpretações de estatísticas ou categorizações de receitas e despesas geradas pela app estejam livres de erros. A app é uma ferramenta de apoio à tua organização financeira pessoal e não constitui aconselhamento financeiro, fiscal, jurídico ou de investimento profissional (ver também o ponto 5). Qualquer decisão financeira tomada com base na informação da app é da tua inteira responsabilidade.",
            "Nos termos do Decreto-Lei n.º 446/85 (cláusulas contratuais gerais) e do Código Civil português, a nossa responsabilidade civil por danos que te sejam causados está limitada aos casos de dolo ou culpa grave.",
            "Salvo nos casos em que a lei aplicável o proíba, não respondemos por: danos indiretos, incidentais, punitivos ou consequenciais; perda de lucros, receitas, dados ou oportunidades de negócio; ou danos decorrentes de falhas de rede, interrupções do serviço, ou acesso não autorizado por terceiros resultante de negligência tua na guarda das tuas credenciais.",
            "Na extensão máxima permitida pela lei portuguesa, a nossa responsabilidade total acumulada por qualquer reclamação decorrente da utilização da app está limitada ao valor total das taxas de subscrição que efetivamente pagaste nos 12 meses imediatamente anteriores ao evento que deu origem à responsabilidade. Se estiveres no plano Gratuito, ou num período experimental sem custos à data do evento, a nossa responsabilidade máxima fica limitada a 50,00 €. Nada nesta cláusula limita direitos que a lei portuguesa te garanta de forma imperativa, nomeadamente os do ponto 4 (livre resolução e conformidade do serviço).",
          ],
        },
        {
          h: "8. Cancelamento e encerramento da conta",
          p: [
            "Podes cancelar a subscrição e eliminar a tua conta a qualquer momento nas Definições; a eliminação apaga os teus dados (ver Política de Privacidade) e não impede a criação de uma nova conta. A única exceção é a eliminação resultante do exercício do direito de livre resolução (ponto 4), que tem um bloqueio de 6 meses associado. Podemos suspender contas em caso de violação destes termos ou de utilização abusiva.",
          ],
        },
        {
          h: "9. Alterações, lei aplicável e litígios",
          p: [
            "Podemos alterar estes termos e avisamos-te na app antes de as alterações relevantes entrarem em vigor. Lei aplicável: estes termos e qualquer litígio decorrente da utilização da app regem-se pela lei portuguesa; se és consumidor residente noutro Estado-Membro da União Europeia, esta escolha não afasta a proteção das regras imperativas do teu país de residência. Foro: em caso de litígio judicial, como consumidor podes propor a ação nos tribunais portugueses ou nos tribunais do Estado-Membro da União Europeia onde resides.",
            "Resolução alternativa de litígios: nos termos da Lei n.º 144/2015, em caso de litígio de consumo que não consigamos resolver diretamente contigo, podes recorrer ao Centro de Arbitragem de Conflitos de Consumo de Lisboa (CACCL) — Rua dos Douradores, n.º 112, 2.º, 1100-207 Lisboa; e-mail juridico@centroarbitragemlisboa.pt; telefone (+351) 218 80 70 30; www.centroarbitragemlisboa.pt — ou ao centro de arbitragem da tua área de residência.",
            "Livro de Reclamações Eletrónico: nos termos da lei portuguesa, disponibilizamos um Livro de Reclamações Eletrónico, acessível a partir do link no rodapé da página de acesso.",
            "Última atualização: " + LEGAL_UPDATED + ".",
          ],
        },
      ],
    },
    en: {
      title: "Terms of Service",
      sections: [
        {
          h: "1. Acceptance",
          p: [
            "By creating an account or using FinanceFlow you accept these terms and the Privacy Policy. The service is provided by Dinis Miguel da Silva Costa, tax ID (NIF): 176280340, contact dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. The service",
          p: [
            "FinanceFlow is a personal-finance app (transaction tracking, budgets, statistics, forecasts and investment records), available on the web and on Android.",
          ],
        },
        {
          h: "3. Your account",
          p: [
            "You are responsible for keeping your password and authenticator safe and for all activity on your account. We recommend enabling two-factor authentication and saving your recovery codes. Tell us immediately if you suspect unauthorised access.",
            "You must provide accurate information and have the legal capacity to enter into this contract.",
          ],
        },
        {
          h: "4. Plans and payments",
          p: [
            "There is a Free plan with limits and paid plans (Pro and Premium) with more features, at the price shown in the app when you subscribe. Payments are processed by EasyPay.",
            "Card and direct debit: subscription that renews automatically until you cancel it (Settings → Subscription); you keep access until the end of the period already paid.",
            "MB WAY and Multibanco: a one-off payment for a fixed period (1, 3, 6 or 12 months), with no automatic renewal; access ends at the end of the paid period unless you pay again. An unpaid reference does not grant access to the plan.",
            "Right of withdrawal and refunds: if you are a consumer, you may withdraw from the contract within 14 days of its conclusion, without giving any reason, by contacting us at dinismiguelcosta@gmail.com. We do not deduct any amount for the service already used during that period: we refund the full amount paid, within 14 days of learning of your decision, using the same payment method as the purchase where possible. In exchange for the full refund, your account is deleted and you cannot create a new account with the same email for the following 6 months; this block only applies to this case, not to account deletion in other circumstances (see section 8). If the service does not work as agreed, you are entitled to have it brought into conformity and, where that is impossible or disproportionate, to a price reduction or to terminate the contract with a refund, as provided by law.",
          ],
        },
        {
          h: "5. AI-generated content and financial information",
          p: [
            "Statistics insights, investment tips, forecasts and automatic document reading are produced by automated systems, are for information and education only and may contain errors.",
            "Nothing in the app is financial, investment, tax or legal advice, or a personal recommendation to buy or sell any financial product. Decisions and risks are yours. Always review data extracted from a document before saving it.",
          ],
        },
        {
          h: "6. Acceptable use",
          p: [
            "You may not use the service for unlawful purposes, try to access other people’s accounts or data, bypass limits or security measures, overload the service or reverse engineer it beyond what the law allows.",
          ],
        },
        {
          h: "7. Availability and limitation of liability",
          p: [
            'We work to keep the service available, but the app is provided "as is" and "as available", without express or implied warranties, including as to data accuracy, uninterrupted operation, freedom from errors, fitness for a particular purpose or non-infringement of third-party rights.',
            "We do not guarantee that the analyses, forecasts, statistics interpretations or income/expense categorisations generated by the app are error-free. The app is a tool to support your personal financial organisation and is not professional financial, tax, legal or investment advice (see also section 5). Any financial decision made based on the app's information is entirely your responsibility.",
            "Under Portuguese Decree-Law 446/85 (general contract terms) and the Portuguese Civil Code, our civil liability for damage caused to you is limited to cases of wilful misconduct or gross negligence.",
            "Except where applicable law does not allow it, we are not liable for: indirect, incidental, punitive or consequential damages; loss of profits, revenue, data or business opportunities; or damage arising from network failures, service interruptions, or unauthorised third-party access resulting from your own negligence in safeguarding your credentials.",
            "To the maximum extent permitted by Portuguese law, our total accumulated liability for any claim arising from your use of the app is limited to the total subscription fees you actually paid in the 12 months immediately preceding the event giving rise to liability. If you were on the Free plan, or on a free trial period, at the time of the event, our maximum liability is limited to €50. Nothing in this clause limits any right Portuguese law grants you on a mandatory basis, in particular those in section 4 (right of withdrawal and conformity of the service).",
          ],
        },
        {
          h: "8. Cancellation and account closure",
          p: [
            "You can cancel your subscription and delete your account at any time in Settings; deletion erases your data (see the Privacy Policy) and does not prevent creating a new account. The only exception is deletion resulting from exercising the right of withdrawal (section 4), which carries a 6-month block. We may suspend accounts that breach these terms or are used abusively.",
          ],
        },
        {
          h: "9. Changes, governing law and disputes",
          p: [
            "We may change these terms and will tell you in the app before material changes take effect. Governing law: these terms and any dispute arising from the use of the app are governed by Portuguese law; if you are a consumer resident in another EU Member State, this choice does not remove the protection of the mandatory rules of your country of residence. Jurisdiction: in case of court proceedings, as a consumer you may bring the action before the Portuguese courts or before the courts of the EU Member State where you live.",
            "Alternative dispute resolution: under Portuguese Law 144/2015, in a consumer dispute we cannot resolve directly with you, you may turn to the Lisbon Consumer Conflict Arbitration Centre (Centro de Arbitragem de Conflitos de Consumo de Lisboa, CACCL) — Rua dos Douradores, n.º 112, 2.º, 1100-207 Lisbon, Portugal; email juridico@centroarbitragemlisboa.pt; phone (+351) 218 80 70 30; www.centroarbitragemlisboa.pt — or the arbitration centre for your area of residence.",
            "Electronic Complaints Book: as required by Portuguese law, we provide an Electronic Complaints Book, accessible from the link in the footer of the sign-in page.",
            "Last updated: " + LEGAL_UPDATED + ".",
          ],
        },
      ],
    },
  },
};
