import type { HelpSection } from '../helpContent'

export const helpEs: HelpSection[] = [
  {
    id: 'transactions',
    title: 'Transacciones y categorías',
    items: [
      { id: 'add-transaction', q: '¿Cómo registro un gasto o un ingreso?', a: 'Toca el botón + (o «Nueva transacción» en el panel), elige el tipo, el importe, la categoría y la fecha. En los planes Pro y Premium también puedes hacer una foto a un recibo o factura: la IA rellena los campos y tú los revisas antes de guardar.' },
      { id: 'categories', q: '¿Puedo crear mis propias categorías?', a: 'Sí, en Ajustes → Categorías. En el plan Gratis puedes tener 2 categorías propias, además de las que vienen con la cuenta; en Pro y Premium son ilimitadas.' },
      { id: 'free-limit', q: '¿El plan Gratis tiene límites?', a: 'Hasta 50 transacciones al mes y 2 categorías propias. El panel y los gráficos por categoría están incluidos.' },
      { id: 'currency', q: '¿Puedo ver los importes en otra moneda?', a: 'Sí, en Ajustes → Moneda eliges entre más de 100 monedas. Los importes se convierten al cambio del día; tus datos siguen guardados en euros.' },
    ],
  },
  {
    id: 'budgets',
    title: 'Grupos y presupuestos',
    items: [
      { id: 'groups', q: '¿Para qué sirven los grupos?', a: 'Reúnen las transacciones de un tema (casa, vacaciones, un proyecto) y permiten un tope mensual o semanal, con un aviso cuando llegas a un porcentaje de ese tope. Disponible en los planes Pro y Premium.' },
      { id: 'ai-budget', q: '¿Qué es el presupuesto sugerido por IA?', a: 'En Premium, con al menos 3 meses completos de gastos, la app propone un límite mensual para cada categoría y grupo, a partir de tus ingresos, tus gastos fijos, el fondo de maniobra y tu meta de ahorro. Lo revisas, ajustas y aplicas — y puedes deshacerlo.' },
      { id: 'ai-budget-once', q: '¿Por qué solo puedo pedir el presupuesto una vez al mes?', a: 'Cada petición usa la IA y la propuesta se guarda el resto del mes: puedes aplicarla y deshacerla las veces que quieras. El mes siguiente puedes pedir una nueva.' },
      { id: 'fixed-costs', q: '¿Qué son los gastos fijos y el fondo de maniobra?', a: 'Los gastos fijos son gastos regulares que no se recortan (alquiler, facturas, suscripciones): la app nunca les baja el límite. El fondo de maniobra es la parte de los ingresos que queda libre para imprevistos — un 10 % por defecto.' },
    ],
  },
  {
    id: 'ai',
    title: 'IA y privacidad',
    items: [
      { id: 'ai-data', q: '¿Qué datos van a la IA?', a: 'Solo totales ya calculados (por mes y por categoría), nombres de categorías y, en el presupuesto sugerido, los ingresos esperados y los porcentajes que eliges. Las descripciones de tus transacciones nunca se envían.' },
      { id: 'scan-privacy', q: '¿Qué pasa con las fotos de los recibos?', a: 'La imagen o el PDF se envía a la IA solo para leer los campos, se procesa en memoria y no se guarda. Evita documentos con datos personales innecesarios.' },
      { id: 'investment-tips', q: '¿Los consejos de inversión son asesoramiento financiero?', a: 'No. Son contenido educativo adaptado a tu perfil de riesgo (Premium) y pueden contener errores. Las decisiones y los riesgos son tuyos.' },
    ],
  },
  {
    id: 'forecasts',
    title: 'Previsiones',
    items: [
      { id: 'forecast-how', q: '¿Cómo funcionan las previsiones?', a: 'En Premium, un modelo de IA aprende de tus meses completos y prevé los ingresos, los gastos y el saldo de los próximos 3 meses. Funciona en tu dispositivo: tus datos no salen de él para esto.' },
      { id: 'forecast-simple', q: '¿Por qué aparece «previsión simple»?', a: 'El modelo de IA necesita 5 meses completos. Con 2 a 4, la app sigue la tendencia de tus meses. El mes en curso nunca cuenta, porque todavía está incompleto.' },
    ],
  },
  {
    id: 'subscription',
    title: 'Suscripción y pagos',
    items: [
      { id: 'plans', q: '¿Qué planes hay?', a: 'Gratis, Pro y Premium. Consulta lo que incluye cada uno y los precios en Suscripción.' },
      { id: 'payment-methods', q: '¿Cómo puedo pagar?', a: 'En la web: tarjeta o domiciliación (con renovación automática), MB WAY o Multibanco (pago único de 1, 3, 6 o 12 meses). En la app Android, a través de Google Play.' },
      { id: 'cancel', q: '¿Cómo cancelo la suscripción?', a: 'Si compraste en la web, en Ajustes → Suscripción; mantienes el acceso hasta el final del periodo pagado. Si compraste en la app Android, cancela en Google Play (Pagos y suscripciones).' },
      { id: 'refund', q: '¿Puedo pedir un reembolso?', a: 'Sí, en los primeros 14 días y sin indicar el motivo (derecho de desistimiento): escríbenos. Devolvemos el importe total y la cuenta se elimina — los detalles están en los Términos, punto 4.' },
    ],
  },
  {
    id: 'account',
    title: 'Seguridad y cuenta',
    items: [
      { id: 'forgot-password', q: 'He olvidado la contraseña. ¿Y ahora?', a: 'En la pantalla de inicio de sesión, toca «¿Has olvidado la contraseña?»: te enviamos un enlace, válido 30 minutos, para establecer una nueva.' },
      { id: 'two-factor', q: '¿Cómo activo la autenticación en dos pasos?', a: 'En Ajustes, en la autenticación en dos pasos, escanea el código QR con una app de autenticación y guarda los códigos de recuperación. A partir de ahí, el inicio de sesión pide también el código de la app.' },
      { id: 'biometric', q: '¿Puedo bloquear la app con la huella?', a: 'Sí, en la app Android, en Ajustes → Bloqueo biométrico. Necesitas tener una huella o el rostro registrados en el teléfono.' },
      { id: 'export-delete', q: '¿Cómo exporto o elimino mis datos?', a: 'En Ajustes → Privacidad y datos puedes descargarlo todo en JSON o eliminar la cuenta y todos los datos.' },
      { id: 'language', q: '¿Cómo cambio el idioma?', a: 'En la pantalla de inicio de sesión o en Ajustes → Idioma. Si no eliges ninguno, la app sigue el idioma del teléfono.' },
    ],
  },
]
