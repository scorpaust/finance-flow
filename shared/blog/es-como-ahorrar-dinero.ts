import type { BlogPost } from './index'

export const comoAhorrarDinero: BlogPost = {
  key: 'save-money',
  slug: 'como-ahorrar-dinero',
  lang: 'es',
  title: 'Cómo ahorrar dinero: 6 pasos que funcionan de verdad',
  description: 'Un método sencillo para ahorrar cada mes: saber adónde va el dinero, ahorrar primero, poner límites por categoría y crear un fondo de emergencia.',
  published: '2026-10-24',
  blocks: [
    { type: 'p', text: 'Casi todo el mundo quiere ahorrar más, y casi todo el mundo lo ha intentado. El problema rara vez es la falta de fuerza de voluntad: es intentar recortar gastos sin saber cuáles son. Estos seis pasos siguen un orden pensado para eso. Primero descubres adónde va el dinero y después decides qué cambiar.' },

    { type: 'h2', text: '1. Apunta todos tus gastos durante dos meses' },
    { type: 'p', text: 'Antes de cambiar nada, apunta todo lo que gastas: supermercado, cafés, gasolina, comida a domicilio, suscripciones, el regalo de cumpleaños de un compañero. No recortes nada todavía. El objetivo es tener una foto real de tus gastos, no la que tienes en la cabeza.' },
    { type: 'p', text: 'Al final del primer mes, agrupa los gastos por categoría. A la mayoría de la gente le sorprenden las pequeñas cantidades que se repiten: tres euros al día en cafés y tentempiés son unos 90 € al mes, más de 1000 € al año.' },
    { type: 'tip', text: 'Apunta cada gasto en el momento, en el móvil. Quien lo deja para la noche se olvida de la mitad, y quien lo deja para el fin de semana acaba abandonando.' },

    { type: 'h2', text: '2. Ahorra primero, gasta después' },
    { type: 'p', text: 'Si ahorras lo que sobra a final de mes, ahorrarás poco o nada, porque casi nunca sobra. Invierte el orden: el día que cobras la nómina, transfiere enseguida una cantidad fija a una cuenta aparte, y solo después empieza a gastar.' },
    { type: 'p', text: 'Empieza con una cantidad que no duela, aunque sea el 5 % del sueldo. Es más fácil aumentar un ahorro que ya existe que empezar uno grande. Si tu banco lo permite, programa una transferencia automática para el día siguiente al cobro de la nómina: así ni tienes que acordarte.' },

    { type: 'h2', text: '3. Da a cada categoría un límite mensual' },
    { type: 'p', text: 'Con los datos del paso 1, decide cuánto quieres gastar al mes en cada categoría: alimentación, restaurantes, transporte, ocio, compras. No tiene que ser perfecto. Empieza por lo que gastaste de media y recorta un poco en las categorías que te sorprendieron.' },
    { type: 'p', text: 'Una forma sencilla de empezar es la regla 50/30/20: alrededor del 50 % de los ingresos para necesidades (vivienda, facturas, alimentación, transporte), el 30 % para caprichos y el 20 % para ahorro. No es una ley, es un punto de partida que luego ajustas a tu realidad.' },
    { type: 'tip', text: 'Ejemplo: con un sueldo neto de 1200 €, serían unos 600 € para necesidades, 360 € para caprichos y 240 € para ahorrar. Si el alquiler ya se lleva 550 €, los números cambian, y no pasa nada: lo importante es decidir los límites antes de que empiece el mes.' },
    { type: 'p', text: 'Cuando se acaba el límite de una categoría, se acabó hasta el mes siguiente. Si una categoría se pasa todos los meses, el límite no era realista: ajústalo y saca la diferencia de otra.' },

    { type: 'h2', text: '4. Revisa las suscripciones y los recibos domiciliados' },
    { type: 'p', text: 'Streaming, gimnasio, almacenamiento en la nube, aplicaciones, revistas, seguros que ya no tienen sentido. Cada uno parece poco, pero juntos llegan fácilmente a 50 € o 100 € al mes.' },
    { type: 'ul', items: [
      'Abre los extractos de los últimos tres meses y apunta todos los pagos que se repiten.',
      'Cancela lo que no hayas usado en el último mes. Si lo echas de menos, vuelves a suscribirte.',
      'En los servicios que mantengas, mira si hay un plan más barato o compartido.',
      'Repite esta revisión dos veces al año.',
    ] },

    { type: 'h2', text: '5. Crea un fondo de emergencia antes de invertir' },
    { type: 'p', text: 'Un fondo de emergencia es dinero guardado solo para imprevistos: el coche que se avería, una factura del dentista, un mes sin ingresos. Lo habitual es el equivalente a tres a seis meses de gastos esenciales, en un sitio donde puedas sacarlo rápido.' },
    { type: 'p', text: 'Sin este fondo, un imprevisto acaba en la tarjeta de crédito o en un préstamo personal, y los intereses se comen lo que ahorraste. Con él, un mes malo es solo un mes malo. Solo cuando lo tengas tiene sentido pensar en invertir.' },

    { type: 'h2', text: '6. Espera 48 horas antes de las compras no esenciales' },
    { type: 'p', text: 'Muchas compras por impulso dejan de parecer necesarias a los dos días. Antes de cualquier compra no esencial por encima de una cantidad que decidas (por ejemplo, 50 €), apúntala en una lista y espera 48 horas. Si todavía la quieres, cómprala sin culpa y dentro del límite de la categoría.' },
    { type: 'p', text: 'También ayuda desactivar las notificaciones de ofertas de las tiendas y no guardar los datos de la tarjeta en las webs donde sueles comprar por impulso. Un paso más suele bastar para que cambies de idea.' },

    { type: 'h2', text: 'Qué hacer a continuación' },
    { type: 'p', text: 'No hace falta aplicar los seis pasos a la vez. Empieza por el primero: apunta tus gastos durante un mes. Todo lo demás es más fácil cuando sabes adónde va el dinero.' },
    { type: 'p', text: 'Puedes hacerlo en una libreta o en una hoja de cálculo. Lo que importa es mantenerlo. Si prefieres una app, FinanceFlow está pensada para esto: con el plan gratuito registras un gasto en segundos y ves adónde va el dinero, por categoría y por mes. En los planes de pago defines además límites mensuales por categoría y recibes un aviso antes de superarlos.' },
  ],
}
