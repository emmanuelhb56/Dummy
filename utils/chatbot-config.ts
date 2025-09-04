export const TEAMS = {
  comercial: 9025,
  soporte: 9023,
  supervision: 9048,
} as const;

export const INBOX_MAP: Readonly<Record<string, number>> = {
  soporte: 75071,
  principal: 75070,
} as const;

export const INBOX_TO_TEAM: Readonly<Record<string, number>> = {
  principal: TEAMS.comercial,
  soporte: TEAMS.soporte,
  supervision: TEAMS.supervision,
} as const;

// ===============================
// Mensajes de saludo y despedida
// ===============================
export const GREETINGS = [
  "¡Hola! ¿Cómo estás hoy?",
  "¡Bienvenido! Estoy aquí para ayudarte.",
  "Hola, gracias por contactarnos, ¿en qué puedo ayudarte?",
  "¡Hola! ¿Necesitas algo?",
  "Hola, ¿cuál es tu pregunta o inquietud?",
  "¡Bienvenido! Te escucho, ¿qué necesitas?"
];

export const FAREWELLS = [
  "¡Hasta luego, que tengas un excelente día!",
  "Gracias por tu tiempo, aquí estaré si necesitas algo más.",
  "¡Que tengas un gran día, nos vemos pronto!",
  "Gracias por confiar en nosotros, te esperamos para la próxima.",
  "Adiós por ahora, esperamos que hayas disfrutado de tu experiencia.",
  "¡Hasta luego! Esperamos verte pronto por aquí.",
  "Gracias por tu tiempo, que tengas un excelente día.",
  "Que tengas un excelente día, no dudes en hacernos saber si necesitas algo más.",
  "¡Que tengas un gran día! No dudes en preguntar si tienes otra pregunta."
];

export const REOPENINGS = [
  "¡Hola! Te escribo para ver si necesitas algo.",
  "¿Necesitas algo? Estamos aquí para ayudarte.",
  "Hola, ¿cómo estás? Te recuerdo que estamos aquí para ayudarte.",
  "Te hacemos saber que seguimos aquí para ayudarte.",
  "¡Hola! ¿Necesitas algo? No dudes en hacernos saber.",
  "Hola, esperamos que hayas disfrutado de tu experiencia.",
  "Te agradecemos que nos contactes, ¿necesitas algo?",
  "Que tengas un excelente día, no dudes en hacernos saber si necesitas algo más.",
  "Es un placer ayudarte, no dudes en hacernos saber si necesitas algo.",
];

// ===============================
// Flow rules
// ===============================
export const FLOW_RULES = {
  principal: { 
    assignTeamId: TEAMS.comercial, 
    tags: ["lead_calificado", "marketing"], 
    priority: "high" as const,              
  },
  soporte: { 
    assignTeamId: TEAMS.soporte, 
    tags: ["soporte_incidente"],            
    priority: "medium" as const,           
  },
  supervision: { 
    assignTeamId: TEAMS.supervision, 
    tags: ["escalado_supervision"],         
    priority: "high" as const,              
  },
} as const;

// ----------------------------
// Conocimiento / KB
// ----------------------------
export interface KnowledgeBaseItem {
  triggers: readonly string[];
  response: string | ((hasPhone: boolean) => string);
  inbox: keyof typeof INBOX_MAP;
  tags: readonly string[];
  controlTag?: string;
  maxResponses?: number;
  exceededResponse: string; 
}

// ----------------------------
// Helpers
// ----------------------------
function randomMessage(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}

// Add the missing function
function responseWithPhoneCheck(messages: string[], hasPhone: boolean): string[] {
  if (!hasPhone) return messages;
  return messages.map(m =>
    m.replace(
      /Déjanos tu teléfono|Proporciona tu teléfono|Déjanos tu número/g,
      "Atenderemos tu solicitud de forma prioritaria"
    ).trim()
  );
}

// ----------------------------
// Base de conocimiento
// ----------------------------
export const KNOWLEDGE_BASE: readonly KnowledgeBaseItem[] = [
  // 1. Consultas de precio / plan / demo
  {
    triggers: ["precio", "plan", "demo", "contratar", "suscripción", "costo"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "💼 ¡Hola! Para consultas sobre planes o demos, podemos enviarte todos los detalles. Déjanos tu teléfono y te contactaremos con información y promociones exclusivas, incluyendo un caso de éxito reciente que muestra cómo optimizamos procesos para empresas como la tuya.",
      "💼 ¡Hola! Queremos ayudarte a elegir el plan adecuado. Proporciona tu teléfono y te enviaremos toda la información junto con nuestra oferta especial de esta semana.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_calificado", "consulta_precio", "marketing"],
    controlTag: "kb_respondida_demo",
    maxResponses: 2,
    exceededResponse: "¡Gracias por tu tiempo! No dudes en hacernos saber si necesitas algo más."
  },

  // 2. Promociones y ofertas
  {
    triggers: ["descuento", "promoción", "oferta", "rebaja", "cupón", "promociones", "promos", "promo"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🎁 ¡Tenemos ofertas especiales este mes! Déjanos tu teléfono y te enviaremos los detalles directamente. Por ejemplo, nuestra promo semanal da un 15% adicional en planes seleccionados.",
      "🎁 ¡Excelente! Aprovecha nuestras promociones: esta semana, 2 meses gratis al contratar el plan anual. Proporciona tu teléfono para enviarte la oferta y detalles exclusivos.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_calificado", "promocion", "marketing"],
    controlTag: "kb_respondida_promocion",
    maxResponses: 2,
    exceededResponse: "¡Ya te enviamos la oferta! Aprovecha mientras dura. No dudes en hacernos saber si necesitas algo más."
  },

  // 3. Demo gratuita
  {
    triggers: ["demo gratuita", "prueba", "test", "try", "free trial"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🖥️ ¡Genial que quieras probar nuestro servicio! Déjanos tu número y te enviaremos la demo gratuita, con ejemplos de funcionalidades clave y consejos para optimizar tu flujo de trabajo.",
      "🖥️ ¡Excelente! Proporciona tu teléfono y recibirás la demo gratuita, incluyendo casos de éxito de otros usuarios que lograron resultados rápidamente.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_calificado", "solicitud_demo", "marketing"],
    controlTag: "kb_respondida_demo_gratis",
    maxResponses: 1,
    exceededResponse: "¡Ya te enviamos la demo gratuita! Aprovecha mientras dura. No dudes en hacernos saber si necesitas algo más."
  },

  // 4. Seguimiento post demo
  {
    triggers: ["seguimiento demo", "feedback demo", "opinión demo"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "📞 ¡Gracias por probar nuestra demo! Queremos conocer tu opinión y ofrecerte un plan especial. Déjanos tu teléfono y te contactaremos con una oferta personalizada.",
      "📞 Queremos tu feedback sobre la demo. Proporciona tu teléfono y te enviaremos un caso de éxito similar a tu perfil que podría interesarte.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_calificado", "followup_demo", "marketing"],
    controlTag: "kb_followup_demo",
    maxResponses: 1,
    exceededResponse: "¡Gracias por tu tiempo! No dudes en hacernos saber si necesitas algo más. Estamos aquí para ayudarte."
  },

  // 5. Información adicional sobre planes
  {
    triggers: ["características", "beneficios", "funcionalidades", "comparar planes"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "📊 Podemos enviarte un resumen completo de nuestros planes y beneficios. Déjanos tu teléfono y recibirás también un ejemplo de ahorro y productividad según el plan elegido.",
      "📊 Consulta las características de cada plan y sus ventajas. Proporciona tu teléfono y te enviaremos un comparativo práctico que te ayudará a decidir.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_calificado", "info_planes", "marketing"],
    controlTag: "kb_info_planes",
    maxResponses: 1,
    exceededResponse: "¡Gracias por tu interés! No dudes en hacernos saber si necesitas algo más. Estamos aquí para ayudarte."
  },

  // 6. Reactivación de clientes antiguos
  {
    triggers: ["volver a usar", "reactivar cuenta", "regresar", "ex-usuario"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🔄 ¡Qué gusto verte de nuevo! Tenemos promociones exclusivas para clientes que regresan. Déjanos tu teléfono y te contactaremos con un plan especial de reactivación.",
      "🔄 Nos encantaría que vuelvas a disfrutar de nuestros servicios. Proporciona tu teléfono y recibirás detalles de nuestra oferta para antiguos clientes.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_reactivacion", "marketing"],
    controlTag: "kb_reactivacion_cliente",
    maxResponses: 1,
    exceededResponse: "¡Ya te enviamos la oferta de reactivación! No dudes en hacernos saber si necesitas algo más. Estamos aquí para ayudarte."
  },

  // 7. Upsell / cross-sell
  {
    triggers: ["más servicios", "upgrade", "mejor plan", "premium"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🚀 ¿Quieres llevar tu plan al siguiente nivel? Déjanos tu número y te contactaremos para ofrecerte mejoras exclusivas y descuentos por tiempo limitado.",
      "🚀 Tenemos opciones premium que aumentan tus beneficios hasta un 30%. Proporciona tu teléfono y te enviaremos una recomendación personalizada.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["upsell", "marketing"],
    controlTag: "kb_upsell",
    maxResponses: 1,
    exceededResponse: "¡Ya te compartimos las opciones premium! Si necesitas más información, no dudes en avisarnos."
  },

  // 8. Solicitudes de información general
  {
    triggers: ["horario", "contacto", "ubicación", "dirección"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "📍 Aquí tienes los detalles de contacto y horarios. Puedes visitarnos o escribirnos directamente.",
      "📍 Te compartimos la ubicación y horario de atención. Estamos disponibles para cualquier consulta."
    ], hasPhone)),
    inbox: "principal",
    tags: ["informacion_general", "marketing"],
    controlTag: "kb_info_general",
    maxResponses: 1,
    exceededResponse: "Ya te enviamos la información de contacto. Si necesitas algo más, aquí estamos para ayudarte."
  },

  // 9. Facturación
  {
    triggers: ["factura", "cfdi", "pago", "recibo"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🧾 Puedes descargar tu factura desde tu cuenta o ver un resumen de tus transacciones.",
      "🧾 Si necesitas asistencia personalizada con facturación, déjanos tu teléfono y te ayudaremos rápidamente."
    ], hasPhone)),
    inbox: "soporte",
    tags: ["soporte_incidente", "facturacion"],
    controlTag: "kb_respondida_factura",
    maxResponses: 2,
    exceededResponse: "Ya hemos respondido tu consulta de facturación. Si surge algo adicional, por favor avísanos."
  },

  // 10. Login / acceso
  {
    triggers: ["login", "contraseña", "usuario", "acceso"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🔑 Para problemas de acceso, usa '¿Olvidaste tu contraseña?' en nuestra plataforma.",
      "🔑 Si necesitas ayuda personalizada para recuperar tu acceso, déjanos tu teléfono y te guiaremos."
    ], hasPhone)),
    inbox: "soporte",
    tags: ["soporte_tecnico", "acceso"],
    controlTag: "kb_respondida_login",
    maxResponses: 2,
    exceededResponse: "Ya te compartimos cómo recuperar el acceso. Si persiste el problema, contáctanos directamente."
  },

  // 11. Problemas técnicos
  {
    triggers: ["error", "problema técnico", "fallo", "bug"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "⚙️ Lamentamos el inconveniente. Proporciona tu número de contacto y nuestro equipo técnico se pondrá en comunicación contigo. También podemos ofrecerte un tutorial para evitar errores similares.",
      "⚙️ Déjanos tu teléfono y solucionaremos tu problema rápidamente. Además, recibirás recomendaciones personalizadas para optimizar tu experiencia.",
    ], hasPhone)),
    inbox: "soporte",
    tags: ["soporte_funcionalidad", "soporte_incidente"],
    controlTag: "kb_error_tecnico",
    maxResponses: 2,
    exceededResponse: "Ya registramos tu problema técnico. Nuestro equipo lo está atendiendo, gracias por tu paciencia."
  },

  // 12. Recuperación de contraseña
  {
    triggers: ["recuperar contraseña", "olvidé contraseña", "reset password"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🔐 Para recuperar tu contraseña, sigue el enlace '¿Olvidaste tu contraseña?' en nuestra plataforma.",
      "🔐 Si surge algún inconveniente durante el proceso, déjanos tu teléfono y te asistiremos paso a paso."
    ], hasPhone)),
    inbox: "soporte",
    tags: ["soporte_tecnico", "acceso"],
    controlTag: "kb_recuperar_contrasena",
    maxResponses: 2,
    exceededResponse: "Ya te enviamos las instrucciones para recuperar tu contraseña. Si tienes algún problema adicional, avísanos.",
  },

  // 13. Actualizaciones de producto
  {
    triggers: ["novedades", "actualización", "update", "new features"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "✨ Tenemos nuevas funcionalidades y mejoras. Déjanos tu teléfono para enviarte información detallada y una demo de las novedades. Por ejemplo, ahora puedes personalizar tu panel de control con widgets y reportes automáticos.",
      "✨ ¡Actualizamos nuestro producto! Proporciona tu número y te contactaremos. Incluye nuevas integraciones que facilitan la gestión de tus procesos.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "novedades_producto"],
    controlTag: "kb_actualizaciones_producto",
    maxResponses: 1,
    exceededResponse: "Ya te informamos de nuestras actualizaciones. Si deseas recibir actualizaciones adicionales, háznoslo saber."
  },

  // 14. Testimonios y casos de éxito
  {
    triggers: ["testimonio", "caso de éxito", "historia", "referencia"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🏆 Tenemos varios casos de éxito que podrían interesarte. Déjanos tu teléfono y te compartiremos los detalles directamente, incluyendo resultados concretos de clientes como tú.",
      "🏆 Proporciona tu número y te enviaremos historias de éxito recientes que muestran cómo nuestros clientes han optimizado sus procesos.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "referencias_cliente"],
    controlTag: "kb_testimonios",
    maxResponses: 1,
    exceededResponse: "Ya te compartimos casos de éxito relevantes. Si deseas más ejemplos, háznoslo saber."
  },

  // 15. Solicitudes de reunión / llamada
  {
    triggers: ["llamada", "reunión", "contacto directo", "hablar con alguien"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "📞 Podemos agendar una llamada contigo para resolver tus dudas. Por favor proporciona tu teléfono y te contactaremos pronto. Además, podemos compartirte material previo a la reunión para que aproveches mejor el tiempo.",
      "📞 Déjanos tu teléfono y agendaremos una reunión. También incluiremos un resumen de nuestros planes y promociones actuales para que tengas toda la información lista.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["lead_calificado", "marketing", "reunion"],
    controlTag: "kb_solicitud_llamada",
    maxResponses: 1,
    exceededResponse: "Ya hemos agendado tu solicitud de reunión. Si quieres ajustar la fecha u hora, avísanos."
  },

  // 16. Consultas de integración
  {
    triggers: ["integración", "API", "connect", "plugin"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🔌 Para consultas sobre integraciones o APIs, déjanos tu teléfono y nuestro equipo de especialistas se comunicará contigo. También podemos enviarte ejemplos de integración con otras plataformas populares.",
      "🔌 Proporciona tu número y te guiaremos en la integración, incluyendo documentación y tips para aprovechar al máximo la API.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "soporte_funcionalidad"],
    controlTag: "kb_integraciones",
    maxResponses: 1,
    exceededResponse: "Ya te enviamos la información sobre integraciones. Si necesitas soporte técnico, indícanoslo.",
  },

  // 17. Renovaciones
  {
    triggers: ["renovar plan", "renovación", "extender suscripción"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🔄 Podemos ayudarte a renovar tu plan sin interrupciones. Déjanos tu teléfono y te contactaremos rápidamente con promociones exclusivas de renovación.",
      "🔄 Proporciona tu número y aseguramos tu renovación, además de ofrecerte beneficios adicionales para clientes que renuevan a tiempo.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "lead_renovacion"],
    controlTag: "kb_renovacion",
    maxResponses: 1,
    exceededResponse: "Ya hemos compartido la oferta de renovación. Si requieres más detalles, estamos atentos."
  },

  // 18. Feedback general
  {
    triggers: ["sugerencia", "feedback", "opinión"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "💬 Gracias por tu feedback. Queremos escucharte más. Déjanos tu número y te contactaremos. También te compartiremos mejoras planeadas según tus comentarios.",
      "💬 Proporciona tu teléfono y podremos profundizar en tus sugerencias, incluyendo oportunidades de personalización y mejoras futuras.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "feedback"],
    controlTag: "kb_feedback",
    maxResponses: 1,
    exceededResponse: "Gracias por tu feedback, ya lo registramos. Si quieres ampliar tu opinión, estaremos encantados de escucharte."
  },

  // 19. Cancelación / baja
  {
    triggers: ["cancelar plan", "darse de baja", "terminar suscripción"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "❌ Lamentamos que quieras cancelar. Déjanos tu teléfono y te contactaremos para ofrecerte alternativas y solucionar tu situación de la mejor manera posible.",
      "❌ Proporciona tu número y revisaremos opciones antes de procesar la baja, incluyendo beneficios especiales que podrías aprovechar.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "soporte_funcionalidad"],
    controlTag: "kb_cancelacion",
    maxResponses: 1,
    exceededResponse: "Ya registramos tu solicitud de cancelación. Si quieres considerar alternativas, estamos disponibles."
  },

  // 20. Consultas legales / términos
  {
    triggers: ["términos", "condiciones", "legal", "política"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "📜 Puedes revisar nuestros términos y condiciones en nuestro sitio web.",
      "📜 Si necesitas aclaraciones legales específicas, déjanos tu teléfono y nuestro equipo te contactará."
    ], hasPhone)),
    inbox: "principal",
    tags: ["informacion_general", "soporte_legal"],
    controlTag: "kb_legal",
    maxResponses: 1,
    exceededResponse: "Ya te compartimos la información legal solicitada. Si necesitas más detalles, avísanos."
  },
  // 21. Capacitación / webinars
  {
    triggers: ["webinar", "capacitación", "tutorial", "curso"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "🎓 Tenemos webinars y capacitaciones disponibles. Déjanos tu teléfono y te enviaremos el calendario con enlaces de inscripción y materiales de aprendizaje.",
      "🎓 Proporciona tu número y recibirás invitaciones a nuestros cursos y tutoriales, incluyendo contenidos exclusivos para clientes activos.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "capacitacion"],
    controlTag: "kb_webinar",
    maxResponses: 1,
    exceededResponse: "Ya te enviamos la información sobre capacitaciones. Si deseas más sesiones, con gusto te las compartimos."
  },

  // 22. Reportes y métricas
  {
    triggers: ["reporte", "estadísticas", "métricas", "dashboard"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "📊 Podemos enviarte reportes y métricas detalladas. Déjanos tu teléfono y recibirás los últimos dashboards de rendimiento y comparativos de uso.",
      "📊 Proporciona tu número y te haremos llegar los reportes más relevantes, incluyendo tips para mejorar tus resultados rápidamente.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "reportes"],
    controlTag: "kb_reportes",
    maxResponses: 1,
    exceededResponse: "Ya compartimos los reportes solicitados. Si requieres métricas adicionales, avísanos."
  },

  // 23. Actualizaciones de facturación / pagos
  {
    triggers: ["actualizar pago", "método de pago", "tarjeta", "suscripción vencida"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "💳 Para actualizar tu método de pago o resolver pagos pendientes, déjanos tu teléfono y nuestro equipo te guiará paso a paso.",
      "💳 Proporciona tu número y te ayudaremos a actualizar la información de pago de manera segura y rápida.",
    ], hasPhone)),
    inbox: "soporte",
    tags: ["soporte_incidente", "facturacion"],
    controlTag: "kb_actualizar_pago",
    maxResponses: 1,
    exceededResponse: "Ya te enviamos las instrucciones para actualizar tu pago. Si necesitas más ayuda, contáctanos."
  },

  // 24. Recordatorios / alertas
  {
    triggers: ["recordatorio", "alerta", "notificación"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "⏰ Podemos enviarte recordatorios y alertas importantes. Déjanos tu teléfono y recibirás avisos de fechas límite, eventos o promociones.",
      "⏰ Proporciona tu número y te enviaremos alertas personalizadas para que no pierdas ninguna oportunidad o aviso relevante.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "alertas"],
    controlTag: "kb_recordatorios",
    maxResponses: 1,
    exceededResponse: "Ya configuramos tus recordatorios. Si quieres agregar más alertas, háznoslo saber."
  },

  // 25. Solicitud de contacto urgente
  {
    triggers: ["urgente", "ahora", "inmediato", "rápido"],
    response: (hasPhone: boolean) => randomMessage(responseWithPhoneCheck([
      "⚡ Entendemos que tu solicitud es urgente. Proporciona tu teléfono y nuestro equipo te contactará de inmediato, con recomendaciones rápidas y efectivas para tu caso.",
      "⚡ Déjanos tu número y atenderemos tu solicitud de forma prioritaria, con instrucciones y consejos rápidos para resolver tu situación.",
    ], hasPhone)),
    inbox: "principal",
    tags: ["marketing", "soporte_funcionalidad"],
    controlTag: "kb_urgente",
    maxResponses: 2,
    exceededResponse: "Ya atendimos tu solicitud prioritaria. Si surge algo más, estamos disponibles para ayudarte de inmediato."
  },
  // 26. Contestación de saludos 
  {
    triggers: ["hola", "buenas", "buenas tardes", "buenas noches", "buenas noches", "buenas noches", "buenas noches", "buenas noches"],
    response: "¡Hola! Estamos para ayudarte, ¿en qué podemos ayudarte?",
    inbox: "principal",
    tags: [],
    controlTag: "kb_bienvenida",
    maxResponses: 2,
    exceededResponse: "Ya te respondimos. Si necesitas algo más, no dudes en hacernos saber."
  },
  // 27. Contestación de sí
  {
    triggers: ["si", "s\\b[ií]"],
    response: (hasPhone: boolean) => {
      if (hasPhone) {
        return "¡Genial! Lo estaremos contactando lo antes posible.";
      } else {
        return "Genial, déjanos tu teléfono y te ayudaremos lo antes posible.";
      }
    },
    inbox: "principal",
    tags: [],
    controlTag: "kb_si",
    maxResponses: 2,
    exceededResponse: "Ya te respondimos. Si necesitas algo más, no dudes en hacernos saber."
  },
 //  28. Contestación de no
  {
    triggers: ["no", "n\\b[oó]"],
    response: "¡Genial! No dudes en hacernos saber si necesitas algo más.",
    inbox: "principal",
    tags: [],
    controlTag: "kb_no",
    maxResponses: 2,
    exceededResponse: "Ya te respondimos. Si necesitas algo más, no dudes en hacernos saber."
  },
];

// ----------------------------
// Etiquetas
// ----------------------------
// ----------------------------
// Colores estándar para etiquetas
// ----------------------------
const TAG_COLORS = {
  green: "#00ff00",
  red: "#ff0000",
  yellow: "#ffff00",
  blue: "#0099ff",
  lightBlue: "#00aaff",
  teal: "#00cc88",
  orange: "#ffaa00",
  lime: "#ccff00",
  gray: "#999999",
} as const;

// ----------------------------
// Tags definidas
// ----------------------------
export const TAGS = [
  // ----------------------------
  // Leads y Marketing
  // ----------------------------
  { title: "lead_calificado", color: TAG_COLORS.green, showInSidebar: true },
  { title: "lead_no_calificado", color: TAG_COLORS.red, showInSidebar: true },
  { title: "consulta_precio", color: TAG_COLORS.yellow, showInSidebar: true },
  { title: "solicitud_demo", color: TAG_COLORS.blue, showInSidebar: true },
  { title: "phone_collected", color: TAG_COLORS.green, showInSidebar: false },
  { title: "promocion", color: TAG_COLORS.orange, showInSidebar: true },
  { title: "followup_demo", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "info_planes", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "lead_reactivacion", color: TAG_COLORS.teal, showInSidebar: true },
  { title: "upsell", color: TAG_COLORS.orange, showInSidebar: true },
  { title: "informacion_general", color: TAG_COLORS.lightBlue, showInSidebar: true },
  { title: "marketing", color: TAG_COLORS.teal, showInSidebar: false },
  { title: "feedback", color: TAG_COLORS.lime, showInSidebar: true },
  { title: "cliente_riesgo", color: TAG_COLORS.red, showInSidebar: true },
  { title: "reunion", color: TAG_COLORS.blue, showInSidebar: true },
  { title: "novedades_producto", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "referencias_cliente", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "eventos", color: TAG_COLORS.lightBlue, showInSidebar: true },
  { title: "lead_renovacion", color: TAG_COLORS.teal, showInSidebar: true },

  // ----------------------------
  // Knowledge Base / temporal
  // ----------------------------
  { title: "kb_respondida_demo", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_respondida_factura", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_respondida_login", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_respondida_promocion", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_respondida_demo_gratis", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_followup_demo", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_info_planes", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_reactivacion_cliente", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_upsell", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_info_general", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_actualizaciones_producto", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_testimonios", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_solicitud_llamada", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_integraciones", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_renovacion", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_feedback", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_cancelacion", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_soporte_pago", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_consultas_legales", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_info_soporte", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_eventos_webinar", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_recomendaciones", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "kb_urgente", color: TAG_COLORS.red, showInSidebar: false },
  { title : "kb_si", color: TAG_COLORS.green, showInSidebar: false },
  { title : "kb_no", color: TAG_COLORS.red, showInSidebar: false },

  // ----------------------------
  // Soporte
  // ----------------------------
  { title: "soporte_incidente", color: TAG_COLORS.orange, showInSidebar: true },
  { title: "soporte_funcionalidad", color: TAG_COLORS.blue, showInSidebar: true },
  { title: "soporte_tecnico", color: TAG_COLORS.orange, showInSidebar: true },

  // ----------------------------
  // Varios / control interno
  // ----------------------------
  { title: "caso_especial", color: TAG_COLORS.red, showInSidebar: true },
  { title: "escalado_supervision", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "cliente-grosero", color: TAG_COLORS.red, showInSidebar: true },
  { title: "bad_language_flag", color: TAG_COLORS.red, showInSidebar: false },
  { title: "conversation_closed", color: TAG_COLORS.gray, showInSidebar: false },
  { title: "auto_bienvenida", color: TAG_COLORS.lightBlue, showInSidebar: false },
  { title: "sin_respuesta", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "escalado_humano", color: TAG_COLORS.orange, showInSidebar: false },
  { title: "no_respuesta", color: TAG_COLORS.red, showInSidebar: false},
  { title: "error_gpt" , color: TAG_COLORS.red, showInSidebar: false },
] as const;

// ---------------------------- 
// // Tags permanentes (para seguimiento, métricas, marketing, soporte) 
// // ---------------------------- 
export const PERMANENT_TAGS: readonly string[] = [ 
  "lead_calificado", 
  "lead_no_calificado", 
  "consulta_precio", 
  "solicitud_demo", 
  "promocion", 
  "followup_demo", 
  "info_planes", 
  "lead_reactivacion", 
  "upsell", 
  "informacion_general", 
  "marketing", 
  "feedback", 
  "cliente_riesgo", 
  "reunion", 
  "novedades_producto", 
  "referencias_cliente", 
  "eventos", 
  "lead_renovacion", 
  "soporte_incidente", 
  "soporte_funcionalidad", 
  "soporte_tecnico", 
  "caso_especial", 
  "escalado_supervision", 
  "cliente-grosero", 
  "bad_language_flag", 
  "conversation_closed", 
  "escalado_humano" 
];

export const TEMP_SEMI_PERMANENT_TAGS: readonly string[] = [
  "kb_urgente",
  "auto_bienvenida",
  "no_respuesta",
  "error_gpt"
];

export const TEMP_NORMAL_TAGS: readonly string[] = [
  "phone_collected",
  "kb_respondida_demo",
  "kb_respondida_factura",
  "kb_respondida_login",
  "kb_respondida_promocion",
  "kb_respondida_demo_gratis",
  "kb_followup_demo",
  "kb_info_planes",
  "kb_reactivacion_cliente",
  "kb_upsell",
  "kb_info_general",
  "kb_actualizaciones_producto",
  "kb_testimonios",
  "kb_solicitud_llamada",
  "kb_integraciones",
  "kb_renovacion",
  "kb_feedback",
  "kb_cancelacion",
  "kb_soporte_pago",
  "kb_consultas_legales",
  "kb_info_soporte",
  "kb_eventos_webinar",
  "kb_recomendaciones"
];

// TEMP_TAGS = normal + semi-permanentes
export const TEMP_TAGS: readonly string[] = [
  ...TEMP_NORMAL_TAGS,
  ...TEMP_SEMI_PERMANENT_TAGS
];

// ----------------------------
// Palabras groseras
// ----------------------------
export const BAD_WORDS = [
  { word: "grosero", severity: "leve" },
  { word: "idiota", severity: "grave" },
  { word: "tonto", severity: "leve" },
  { word: "imbécil", severity: "grave" },
  { word: "puta", severity: "grave" },
  { word: "puto", severity: "grave" }
] as const;

export const BAD_WORDS_RESPONSES = [
  { response: "Lo siento, no puedo responder a palabras groseras. No te preocupes, estoy aquí para ayudarte.", severity: "leve" },
  { response: "No puedo responder a palabras groseras. Si lo deseas, te canalizo con un humano.", severity: "grave" },
  { response: "No puedo responder a palabras groseras. Estoy aquí para ayudarte, no para ofenderte.", severity: "leve" },
  { response: "Lo siento, no puedo responder a palabras groseras. ¿Quieres hablar de algo más?", severity: "leve" },
  { response: "No puedo responder a palabras groseras. Me voy a cerrar esta conversación.", severity: "grave" }
] as const;

// ----------------------------
// Token del bot
// ----------------------------
export const BOT_TOKEN = process.env.BOT_TOKEN || "auBNsnPBgPGZCpKwy2bXpWZz";
