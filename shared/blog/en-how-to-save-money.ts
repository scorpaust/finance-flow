import type { BlogPost } from './index'

export const howToSaveMoney: BlogPost = {
  key: 'save-money',
  slug: 'how-to-save-money',
  lang: 'en',
  title: 'How to save money: 6 steps that actually work',
  description: 'A simple method to save every month: know where your money goes, pay yourself first, set limits per category and build an emergency fund.',
  published: '2026-10-24',
  blocks: [
    { type: 'p', text: 'Almost everyone wants to save more, and almost everyone has tried. The problem is rarely a lack of willpower: it is trying to cut spending without knowing what you spend on. These six steps follow an order designed for that. First you find out where your money goes, then you decide what to change.' },

    { type: 'h2', text: '1. Track every expense for two months' },
    { type: 'p', text: 'Before you change anything, write down everything you spend: groceries, coffees, fuel, food delivery, subscriptions, a colleague\'s birthday present. Don\'t cut anything yet. The goal is a real picture of your spending, not the one you have in your head.' },
    { type: 'p', text: 'At the end of the first month, group your expenses by category. Most people are surprised by the small repeated amounts: three euros a day on coffee and snacks is about €90 a month, more than €1,000 a year.' },
    { type: 'tip', text: 'Log each expense as it happens, on your phone. If you leave it until the evening you forget half of them, and if you leave it until the weekend you give up.' },

    { type: 'h2', text: '2. Pay yourself first, spend afterwards' },
    { type: 'p', text: 'If you save whatever is left at the end of the month, you will save little or nothing, because there is rarely anything left. Reverse the order: on payday, move a fixed amount to a separate account straight away, and only then start spending.' },
    { type: 'p', text: 'Start with an amount that doesn\'t hurt, even if it is only 5% of your salary. It is easier to grow savings that already exist than to start big. If your bank allows it, schedule an automatic transfer for the day after payday, so you don\'t even have to remember.' },

    { type: 'h2', text: '3. Give each category a monthly limit' },
    { type: 'p', text: 'Using the data from step 1, decide how much you want to spend each month in each category: food, eating out, transport, leisure, shopping. It doesn\'t need to be perfect. Start with your average spending and trim a little from the categories that surprised you.' },
    { type: 'p', text: 'A simple way to begin is the 50/30/20 rule: about 50% of your income for needs (housing, bills, food, transport), 30% for wants and 20% for savings. It is not a law, just a starting point that you then adjust to your own situation.' },
    { type: 'tip', text: 'Example: with a take-home pay of €1,200, that is about €600 for needs, €360 for wants and €240 to save. If rent already takes €550, the numbers change, and that is fine: what matters is deciding the limits before the month starts.' },
    { type: 'p', text: 'When a category\'s limit runs out, it is gone until next month. If a category blows its limit every month, the limit was unrealistic: adjust it and take the difference from another one.' },

    { type: 'h2', text: '4. Review your subscriptions and direct debits' },
    { type: 'p', text: 'Streaming, the gym, cloud storage, apps, magazines, insurance you no longer need. Each one looks small, but together they easily add up to €50 or €100 a month.' },
    { type: 'ul', items: [
      'Open your bank statements for the last three months and list every recurring payment.',
      'Cancel anything you haven\'t used in the last month. If you miss it, you can subscribe again.',
      'For the services you keep, check whether there is a cheaper or shared plan.',
      'Repeat this review twice a year.',
    ] },

    { type: 'h2', text: '5. Build an emergency fund before you invest' },
    { type: 'p', text: 'An emergency fund is money set aside only for the unexpected: a car breakdown, a dentist bill, a month without income. The usual target is three to six months of essential expenses, kept somewhere you can withdraw it quickly.' },
    { type: 'p', text: 'Without this fund, a surprise expense ends up on a credit card or a personal loan, and the interest eats what you saved. With it, a bad month is just a bad month. Only once you have it does it make sense to think about investing.' },

    { type: 'h2', text: '6. Wait 48 hours before non-essential purchases' },
    { type: 'p', text: 'Many impulse purchases stop looking necessary after two days. Before any non-essential purchase above an amount you choose (for example, €50), put it on a list and wait 48 hours. If you still want it, buy it without guilt and within the category limit.' },
    { type: 'p', text: 'It also helps to turn off promotional notifications from shops and not to save your card details on the sites where you tend to buy on impulse. One extra step is often enough to make you change your mind.' },

    { type: 'h2', text: 'What to do next' },
    { type: 'p', text: 'You don\'t need to apply all six steps at once. Start with the first one: track your spending for a month. Everything else gets easier once you know where your money goes.' },
    { type: 'p', text: 'You can do it in a notebook or a spreadsheet. What matters is keeping it up. If you prefer an app, FinanceFlow was made for this: on the free plan you log an expense in seconds and see where your money goes, by category and by month. On paid plans you also set monthly limits per category and get an alert before you go over.' },
  ],
}
