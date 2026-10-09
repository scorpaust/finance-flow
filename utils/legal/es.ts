import type { LegalDoc } from "../legalContent";

// Política de Privacidade e Termos em espanhol — tradução da versão EN de
// utils/legalContent.ts. Mudar um texto legal é mudá-lo nas 6 línguas.
export function legalEs(updated: string): { privacy: LegalDoc; terms: LegalDoc } {
  return {
    privacy: {
      title: "Política de privacidad",
      sections: [
        {
          h: "1. Quién es el responsable de tus datos",
          p: [
            "El responsable del tratamiento es Dinis Miguel da Silva Costa, número fiscal portugués (NIF): 176280340. Para cualquier cuestión sobre privacidad: dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. Qué datos tratamos",
          p: [
            "Cuenta: nombre, email y un hash de tu contraseña (nunca guardamos la contraseña en sí). Si activas la autenticación en dos pasos, guardamos el secreto del autenticador cifrado y solo hashes de los códigos de recuperación.",
            "Datos financieros que introduces: transacciones, categorías, grupos y presupuestos, y el registro de inversiones. Si rellenas el cuestionario de perfil de inversor, guardamos tus respuestas.",
            "Suscripción: plan, estado y referencias de pago. Los datos de tarjeta, IBAN o teléfono MB WAY los recoge directamente EasyPay y nunca pasan por nuestros servidores. En las compras hechas en la app Android, el pago se hace en Google Play: solo guardamos el identificador de la compra, el producto y el estado de la suscripción que Google nos comunica.",
            "Preferencias: idioma de la interfaz y, en Android, si has activado el bloqueo biométrico (guardado solo en tu teléfono; la app nunca recibe tu huella dactilar ni tu cara).",
            "Datos técnicos: tu dirección IP se usa para deducir tu país (con una base de datos local, sin enviarla a terceros) y para limitar intentos abusivos; guardamos registros de seguridad (por ejemplo, intentos de inicio de sesión fallidos) sin contraseñas, códigos ni el contenido de tus datos.",
          ],
        },
        {
          h: "3. Para qué usamos los datos y con qué base legal",
          p: [
            "Prestar el servicio que has pedido (gestión de finanzas, suscripciones, previsiones y estadísticas): ejecución del contrato.",
            "Seguridad de la cuenta y prevención de abusos (límites de intentos, registros de seguridad, 2FA): interés legítimo.",
            "Cumplir las obligaciones legales aplicables, por ejemplo fiscales y de facturación: obligación legal.",
            "Las funciones de inteligencia artificial solo envían datos cuando las usas (ver el punto 5).",
          ],
        },
        {
          h: "4. Con quién compartimos los datos (encargados del tratamiento)",
          p: [
            "MongoDB Atlas — alojamiento de la base de datos donde se guardan tus datos.",
            "Netlify — alojamiento de la aplicación; procesa las peticiones hechas a la app, incluida la dirección IP.",
            "EasyPay — procesamiento de pagos (tarjeta, domiciliación, MB WAY, Multibanco).",
            "Google (Google Play) — distribución de la app Android y pago de las suscripciones compradas dentro de ella. Google gestiona esos pagos como vendedor, según su propia política de privacidad; para asociar la compra a tu cuenta solo le enviamos un identificador de cuenta cifrado (nunca tu nombre, tu email ni datos financieros de la app).",
            "Anthropic — proveedor del modelo de IA usado en las funciones descritas en el punto 5.",
            "Twelve Data — datos de mercado y tipos de cambio. Solo recibe símbolos de mercado y pares de divisas, nunca datos personales ni tus importes.",
            "Sentry — monitorización de errores técnicos, configurada para no enviar el contenido de las peticiones, cookies ni cabeceras.",
            "Algunos de estos proveedores pueden tener subencargados o infraestructura fuera del Espacio Económico Europeo; en ese caso se aplican las garantías previstas en el RGPD, en particular las cláusulas contractuales tipo aprobadas por la Comisión Europea.",
          ],
        },
        {
          h: "5. Inteligencia artificial — qué se envía",
          p: [
            "Interpretación de estadísticas (planes Pro y Premium): enviamos valores agregados (totales por mes y por categoría) y nombres de categorías — nunca las descripciones de tus transacciones.",
            "Consejos de inversión (plan Premium): enviamos las respuestas de tu perfil de inversor, un resumen agregado de tus finanzas y el contexto de mercado del día. Por ahora no enviamos ningún dato de tu registro de inversiones (cartera); si eso cambiara, esta política se actualizaría antes.",
            "Presupuesto sugerido (plan Premium): para cada categoría de gasto enviamos su nombre y los totales mensuales ya calculados (media, mínimo, máximo), tus ingresos mensuales esperados y los porcentajes de fondo de maniobra y de ahorro que eliges — nunca las descripciones de tus transacciones. Solo cuando pides una propuesta, como máximo una vez al mes.",
            "Digitalización de documentos (planes Pro y Premium): la imagen o el PDF que subes se envía a Anthropic para extraer los campos, se procesa en memoria y no lo guardamos. Evita subir documentos con datos personales innecesarios (por ejemplo, número fiscal o dirección en una nómina).",
            "El contenido generado por IA es meramente informativo, puede contener errores y no constituye asesoramiento financiero.",
          ],
        },
        {
          h: "6. Cuánto tiempo guardamos los datos",
          p: [
            "Mientras exista tu cuenta. Cuando eliminas la cuenta (Ajustes → Privacidad y datos), borramos tus datos de la base de datos. Las copias de seguridad pueden conservar los datos hasta 3 años antes de sobrescribirse.",
            "Podemos conservar solo lo estrictamente necesario para cumplir obligaciones legales (por ejemplo, registros de facturación) durante el plazo que exija la ley.",
          ],
        },
        {
          h: "7. Tus derechos",
          p: [
            "Acceso y portabilidad: en Ajustes → Privacidad y datos puedes descargar todos tus datos en JSON.",
            "Supresión: en la misma sección puedes eliminar tu cuenta y todos los datos asociados. Si tienes una suscripción con renovación automática, se cancela antes. Si ya no tienes acceso a la app, pide la eliminación por email a dinismiguelcosta@gmail.com desde la dirección asociada a la cuenta.",
            "Eliminar datos sin eliminar la cuenta: puedes borrar transacciones, categorías, grupos e inversiones uno a uno en la app en cualquier momento. Para pedir la eliminación de otros datos concretos sin eliminar la cuenta, escribe a dinismiguelcosta@gmail.com desde la dirección asociada a la cuenta.",
            "Rectificación: puedes corregir tus datos directamente en la app. También tienes derecho a la limitación y a la oposición al tratamiento; contáctanos en dinismiguelcosta@gmail.com.",
            "Puedes presentar una reclamación ante la autoridad portuguesa de protección de datos (CNPD), www.cnpd.pt, o ante la autoridad de tu país.",
          ],
        },
        {
          h: "8. Cookies y almacenamiento local",
          p: [
            "Solo usamos cookies estrictamente necesarias: \"session\" (mantiene tu sesión iniciada, hasta 30 días), \"pending_2fa\" (10 minutos, solo durante la verificación en dos pasos) y \"financeflow_locale\" (tu idioma). También guardamos tu preferencia de bloqueo biométrico en el almacenamiento local del teléfono. No usamos cookies de publicidad ni de análisis de comportamiento.",
          ],
        },
        {
          h: "9. Seguridad",
          p: [
            "Contraseñas guardadas como hash (scrypt), sesiones firmadas, limitación de intentos, autenticación en dos pasos opcional, secretos de 2FA cifrados en reposo y conexiones cifradas (HTTPS). Ningún sistema es infalible; si se produce una violación de datos que te afecte, te lo notificaremos a ti y a la autoridad según exige la ley.",
          ],
        },
        {
          h: "10. Cambios",
          p: [
            "Si cambiamos esta política de forma relevante, te avisaremos en la app. Última actualización: " + updated + ".",
          ],
        },
      ],
    },
    terms: {
      title: "Términos del servicio",
      sections: [
        {
          h: "1. Aceptación",
          p: [
            "Al crear una cuenta o usar FinanceFlow aceptas estos términos y la Política de privacidad. El servicio lo presta Dinis Miguel da Silva Costa, número fiscal portugués (NIF): 176280340, contacto dinismiguelcosta@gmail.com.",
          ],
        },
        {
          h: "2. El servicio",
          p: [
            "FinanceFlow es una aplicación de finanzas personales (registro de transacciones, presupuestos, estadísticas, previsiones y registro de inversiones), disponible en la web y en Android.",
          ],
        },
        {
          h: "3. Tu cuenta",
          p: [
            "Eres responsable de mantener seguros tu contraseña y tu autenticador y de toda la actividad de tu cuenta. Te recomendamos activar la autenticación en dos pasos y guardar los códigos de recuperación. Avísanos de inmediato si sospechas de un acceso no autorizado.",
            "Debes facilitar información veraz y tener capacidad legal para celebrar este contrato.",
          ],
        },
        {
          h: "4. Planes y pagos",
          p: [
            "Hay un plan Gratis con límites y planes de pago (Pro y Premium) con más funciones, al precio indicado en la app en el momento de la suscripción. En el sitio web, los pagos los procesa EasyPay; en la app Android, Google Play. El plan queda asociado a tu cuenta y vale en las dos versiones.",
            "Tarjeta y domiciliación: suscripción con renovación automática hasta que la canceles (Ajustes → Suscripción); mantienes el acceso hasta el final del periodo ya pagado.",
            "MB WAY y Multibanco: pago único por un periodo fijo (1, 3, 6 o 12 meses), sin renovación automática; el acceso termina al final del periodo pagado, salvo que vuelvas a pagar. Una referencia sin pagar no da acceso al plan.",
            "Google Play (app Android): el cobro, la renovación automática y la cancelación los gestiona Google Play, en las condiciones de Google; el pago único por un periodo fijo también está disponible. Un plan comprado en Google Play se gestiona en Google Play, y un plan comprado en el sitio web se gestiona en el sitio web; no es posible tener los dos activos a la vez.",
            "Derecho de desistimiento y reembolsos: si eres consumidor, puedes desistir del contrato en un plazo de 14 días desde su celebración, sin indicar el motivo, escribiéndonos a dinismiguelcosta@gmail.com. No descontamos ningún importe por el servicio ya usado en ese plazo: reembolsamos la totalidad del importe pagado en un máximo de 14 días desde que conozcamos tu decisión, por el mismo medio de pago usado en la compra siempre que sea posible. Como contrapartida del reembolso total, tu cuenta se elimina y no puedes crear una cuenta nueva con el mismo email durante los 6 meses siguientes; este bloqueo solo se aplica a este caso, no a la eliminación de la cuenta en otras circunstancias (ver el punto 8). Si el servicio no funciona según lo acordado, tienes derecho a que se restablezca su conformidad y, si esto es imposible o desproporcionado, a una reducción del precio o a la resolución del contrato con reembolso, según la ley.",
          ],
        },
        {
          h: "5. Contenido generado por IA e información financiera",
          p: [
            "Las interpretaciones de estadísticas, los consejos de inversión, las previsiones, el presupuesto sugerido y la lectura automática de documentos los generan sistemas automáticos, tienen carácter meramente informativo y educativo y pueden contener errores.",
            "Nada en la app constituye asesoramiento financiero, de inversión, fiscal o jurídico, ni una recomendación personalizada para comprar o vender ningún producto financiero. Las decisiones y los riesgos son tuyos. Revisa siempre los datos extraídos de un documento antes de guardarlos.",
          ],
        },
        {
          h: "6. Uso aceptable",
          p: [
            "No puedes usar el servicio con fines ilícitos, intentar acceder a cuentas o datos de otras personas, eludir límites o medidas de seguridad, sobrecargar el servicio ni aplicarle ingeniería inversa más allá de lo que permita la ley.",
          ],
        },
        {
          h: "7. Disponibilidad y limitación de responsabilidad",
          p: [
            "Nos esforzamos por mantener el servicio disponible, pero la app se ofrece \"tal cual\" y \"según disponibilidad\", sin garantías expresas ni implícitas, incluidas las de exactitud de los datos, funcionamiento ininterrumpido, ausencia de errores, idoneidad para un fin concreto o no infracción de derechos de terceros.",
            "No garantizamos que los análisis, previsiones, interpretaciones de estadísticas o categorizaciones de ingresos y gastos generados por la app estén libres de errores. La app es una herramienta de apoyo a la organización de tus finanzas personales y no constituye asesoramiento profesional financiero, fiscal, jurídico ni de inversión (ver también el punto 5). Cualquier decisión financiera tomada a partir de la información de la app es de tu entera responsabilidad.",
            "Según el Decreto-ley portugués n.º 446/85 (condiciones generales de la contratación) y el Código Civil portugués, nuestra responsabilidad civil por los daños que se te causen se limita a los casos de dolo o culpa grave.",
            "Salvo cuando la ley aplicable lo prohíba, no respondemos de: daños indirectos, incidentales, punitivos o consecuentes; pérdida de beneficios, ingresos, datos u oportunidades de negocio; ni daños derivados de fallos de red, interrupciones del servicio o accesos no autorizados de terceros debidos a tu propia negligencia en la custodia de tus credenciales.",
            "En la máxima medida permitida por la ley portuguesa, nuestra responsabilidad total acumulada por cualquier reclamación derivada del uso de la app se limita al importe total de las cuotas de suscripción que hayas pagado efectivamente en los 12 meses inmediatamente anteriores al hecho que dio lugar a la responsabilidad. Si en el momento del hecho estabas en el plan Gratis o en un periodo de prueba gratuito, nuestra responsabilidad máxima se limita a 50,00 €. Nada en esta cláusula limita los derechos que la ley portuguesa te garantiza de forma imperativa, en particular los del punto 4 (desistimiento y conformidad del servicio).",
          ],
        },
        {
          h: "8. Cancelación y cierre de la cuenta",
          p: [
            "Puedes cancelar la suscripción y eliminar tu cuenta en cualquier momento en Ajustes; la eliminación borra tus datos (ver la Política de privacidad) y no impide crear una cuenta nueva. La única excepción es la eliminación derivada del ejercicio del derecho de desistimiento (punto 4), que conlleva un bloqueo de 6 meses. Podemos suspender cuentas que incumplan estos términos o se usen de forma abusiva.",
          ],
        },
        {
          h: "9. Cambios, ley aplicable y litigios",
          p: [
            "Podemos cambiar estos términos y te avisaremos en la app antes de que entren en vigor los cambios relevantes. Ley aplicable: estos términos y cualquier litigio derivado del uso de la app se rigen por la ley portuguesa; si eres un consumidor residente en otro Estado miembro de la Unión Europea, esta elección no te priva de la protección de las normas imperativas de tu país de residencia. Jurisdicción: en caso de proceso judicial, como consumidor puedes acudir a los tribunales portugueses o a los del Estado miembro de la Unión Europea donde resides.",
            "Resolución alternativa de litigios: según la Ley portuguesa n.º 144/2015, en caso de un litigio de consumo que no consigamos resolver directamente contigo, puedes acudir al Centro de Arbitraje de Conflictos de Consumo de Lisboa (Centro de Arbitragem de Conflitos de Consumo de Lisboa, CACCL) — Rua dos Douradores, n.º 112, 2.º, 1100-207 Lisboa, Portugal; email juridico@centroarbitragemlisboa.pt; teléfono (+351) 218 80 70 30; www.centroarbitragemlisboa.pt — o al centro de arbitraje de tu zona de residencia.",
            "Libro de Reclamaciones Electrónico: según la ley portuguesa, ponemos a tu disposición un Libro de Reclamaciones Electrónico (Livro de Reclamações Eletrónico), accesible desde el enlace del pie de la página de acceso.",
            "Última actualización: " + updated + ".",
          ],
        },
      ],
    },
  };
}
