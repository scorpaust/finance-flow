import type { HelpSection } from '../helpContent'

export const helpEn: HelpSection[] = [
  {
    id: 'transactions',
    title: 'Transactions and categories',
    items: [
      { id: 'add-transaction', q: 'How do I log an expense or income?', a: 'Tap the + button (or "New transaction" on the dashboard), choose the type, amount, category and date. On the Pro and Premium plans you can also take a photo of a receipt or invoice: AI fills in the fields and you review them before saving.' },
      { id: 'categories', q: 'Can I create my own categories?', a: 'Yes, in Settings → Categories. On the Free plan you can have 2 custom categories besides the ones that come with your account; on Pro and Premium they are unlimited.' },
      { id: 'free-limit', q: 'Does the Free plan have limits?', a: 'Up to 50 transactions a month and 2 custom categories. The dashboard and charts by category are included.' },
      { id: 'currency', q: 'Can I see amounts in another currency?', a: "Yes, in Settings → Currency you can choose from over 100 currencies. Amounts are converted at the day's exchange rate; your data is still stored in euros." },
    ],
  },
  {
    id: 'budgets',
    title: 'Groups and budgets',
    items: [
      { id: 'groups', q: 'What are groups for?', a: 'They bring together the transactions of a theme (home, holidays, a project) and let you set a monthly or weekly limit, with an alert when you reach a percentage of it. Available on the Pro and Premium plans.' },
      { id: 'ai-budget', q: 'What is the AI-suggested budget?', a: 'On Premium, with at least 3 complete months of expenses, the app suggests a monthly limit for each category and group, based on your income, fixed costs, working capital and savings goal. You review, adjust and apply it — and you can undo.' },
      { id: 'ai-budget-once', q: 'Why can I only ask for the budget once a month?', a: "Each request uses AI and the proposal is kept for the rest of the month: you can apply and undo it as often as you like. Next month you can ask for a new one." },
      { id: 'fixed-costs', q: 'What are fixed costs and working capital?', a: 'Fixed costs are regular expenses you cannot cut (rent, bills, subscriptions): the app never lowers their limit. Working capital is the part of your income kept free for the unexpected — 10% by default.' },
    ],
  },
  {
    id: 'ai',
    title: 'AI and privacy',
    items: [
      { id: 'ai-data', q: 'What data goes to the AI?', a: 'Only totals that are already calculated (per month and category), category names and, for the suggested budget, your expected income and the percentages you choose. Your transaction descriptions are never sent.' },
      { id: 'scan-privacy', q: 'What happens to photos of receipts?', a: 'The image or PDF is sent to the AI only to read the fields, is processed in memory and is not stored. Avoid documents with unnecessary personal data.' },
      { id: 'investment-tips', q: 'Are the investment tips financial advice?', a: 'No. They are educational content tailored to your risk profile (Premium) and may contain errors. Decisions and risks are yours.' },
    ],
  },
  {
    id: 'forecasts',
    title: 'Forecasts',
    items: [
      { id: 'forecast-how', q: 'How do forecasts work?', a: 'On Premium, an AI model learns from your complete months and forecasts income, expenses and balance for the next 3 months. It runs on your device: your data never leaves it for this.' },
      { id: 'forecast-simple', q: 'Why does it say "simple forecast"?', a: 'The AI model needs 5 complete months. With 2 to 4, the app follows the trend of your months. The current month never counts, because it is still incomplete.' },
    ],
  },
  {
    id: 'subscription',
    title: 'Subscription and payments',
    items: [
      { id: 'plans', q: 'Which plans are there?', a: 'Free, Pro and Premium. See what each one includes and the prices in Subscription.' },
      { id: 'payment-methods', q: 'How can I pay?', a: 'On the website: card or direct debit (with automatic renewal), MB WAY or Multibanco (one-off payment for 1, 3, 6 or 12 months). In the Android app, through Google Play.' },
      { id: 'cancel', q: 'How do I cancel my subscription?', a: 'If you bought on the website, in Settings → Subscription; you keep access until the end of the paid period. If you bought in the Android app, cancel in Google Play (Payments & subscriptions).' },
      { id: 'refund', q: 'Can I get a refund?', a: 'Yes, within the first 14 days and without giving a reason (right of withdrawal): write to us. We refund the full amount and the account is deleted — details are in the Terms, section 4.' },
    ],
  },
  {
    id: 'account',
    title: 'Security and account',
    items: [
      { id: 'forgot-password', q: 'I forgot my password. What now?', a: 'On the sign-in screen, tap "Forgot your password?": we send you a link, valid for 30 minutes, to set a new one.' },
      { id: 'two-factor', q: 'How do I turn on two-factor authentication?', a: 'In Settings, under two-factor authentication, scan the QR code with an authenticator app and save the recovery codes. From then on, signing in also asks for the code from the app.' },
      { id: 'biometric', q: 'Can I lock the app with my fingerprint?', a: 'Yes, in the Android app, in Settings → Biometric lock. You need a fingerprint or face enrolled on your phone.' },
      { id: 'export-delete', q: 'How do I export or delete my data?', a: 'In Settings → Privacy and data you can download everything as JSON or delete your account and all its data.' },
      { id: 'language', q: 'How do I change the language?', a: "On the sign-in screen or in Settings → Language. If you don't choose one, the app follows your phone's language." },
    ],
  },
]
