// FAQ base y motor mínimo de matching para ClickBalance
// — Pensado para usarse primero por reglas (barato) y solo si no hay match, usar GPT de respaldo.

import { KBEntry } from "@/types/chatwoot";

// Utilidad simple para normalizar textos (acentos, mayúsculas, espacios)
export function normalize(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/\s+/g, " ")
    .trim();
}

// Matching por reglas: busca por triggers y patterns. Retorna el primer match encontrado.
export function findKBEntry(text: string, kb: KBEntry[]): KBEntry | null {
  const ntext = normalize(text);
  for (const entry of kb) {
    // triggers (contains)
    if (entry.triggers?.some(t => ntext.includes(normalize(t)))) return entry;
    // patterns (regex)
    if (entry.patterns?.some(p => new RegExp(p, "i").test(text))) return entry;
  }
  return null;
}

// Menú inicial (widget/multicanal). Puedes ajustar por canal fuera de este archivo.
export const MENU_MESSAGE = `👋 Hola, soy tu asistente de soporte ClickBalance.
Puedo ayudarte con:
1  Timbrado y facturación
2  Activación de timbres
3  Punto de venta
4  Descarga de XML/PDF
5  Acceso y conectividad
6  Monedas y tipo de cambio
7  Cancelación de facturas
8  ADE (Administrador de Documentos Electrónicos)
9  Nómina
10 Complementos de pago
11 Inventario y productos
12 Certificados digitales (CSD)
13 Clientes y proveedores
14 Contabilidad
15 Membresías y renovaciones
16 Reportes y exportación
17 DIOT
18 Notas de crédito
19 Cortes de luz y recuperación
20 Permisos de usuario
21 Otros

👉 Escribe el número de la opción`;

// KB Base (20 categorías). Respuestas concisas y accionables.
export const KNOWLEDGE_BASE: KBEntry[] = [
  {
    id: "timbrado",
    categoria: "Timbrado y facturación",
    triggers: [
      "no puedo timbrar", "error al timbrar", "cfdi no se puede timbrar",
      "fecha de emision en el futuro", "facturacion error", "problemas timbrado"
    ],
    response:
      "Para errores de timbrado:»\n• Verifica certificados CSD vigentes.\n• Revisa que la fecha de emisión no esté en el futuro.\n• Confirma que tienes timbres disponibles.\n• Valida la configuración de tu empresa.\nSi persiste, comparte el folio y la captura del error para revisar.",
    followups: ["¿Puedes enviar el folio/serie?", "¿Tienes CSD vigente y timbres disponibles?"],
    actions: { addTags: ["kb_timbrado"], controlTag: "kb_timbrado", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["soporte_facturacion"]
  },
  {
    id: "activacion_timbres",
    categoria: "Activación de timbres",
    triggers: ["timbres no aparecen", "no se activan timbres", "compré timbres", "pague timbres"],
    response:
      "Los timbres se activan automáticamente en 15–30 min tras el pago. Si no ves el saldo:»\n• Verifica tu saldo de timbres en la cuenta.\n• Comparte el número de factura/orden para activación manual.\n• Si necesitas comprar, te comparto el link de pago.",
    followups: ["Envíame el número de factura del pago", "¿Deseas el link para comprar timbres?"],
    actions: { addTags: ["kb_timbres"], controlTag: "kb_timbres", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["timbres"]
  },
  {
    id: "punto_venta",
    categoria: "Punto de venta",
    triggers: ["punto de venta no sincroniza", "no deja abrir punto de venta", "sincronizacion punto de venta"],
    response:
      "Para POS:»\n• Verifica tu conexión a internet.\n• Reinicia el punto de venta.\n• Revisa la configuración de sincronización.\n• Si ves 503 es intermitencia del servidor: intenta más tarde.",
    followups: ["¿Sale un código de error?", "¿Probaste reiniciar el POS y el equipo?"],
    actions: { addTags: ["kb_pos"], controlTag: "kb_pos", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["pos"]
  },
  {
    id: "descargas_xml_pdf",
    categoria: "Descargas de XML/PDF",
    triggers: ["no puedo descargar facturas", "xml no se descargan", "error descarga documentos", "descargar pdf"],
    response:
      "Para descargas:»\n• Intenta desde otro navegador.\n• Confirma que el documento esté timbrado.\n• ADE/SAT pueden presentar fallas temporales: intenta más tarde.\n• Comparte el folio específico para revisar.",
    followups: ["¿Cuál es el folio/UUID?"],
    actions: { addTags: ["kb_descargas"], controlTag: "kb_descargas", maxResponses: 3, priority: "medium", assignTeamId: 1 },
    tags: ["descargas"]
  },
  {
    id: "sistema_conectividad",
    categoria: "Acceso / Conectividad",
    triggers: ["sistema lento", "intermitente", "error 503", "no puedo acceder", "service temporarily unavailable"],
    response:
      "Si el sistema está lento o intermitente:»\n• Prueba otro navegador o dispositivo y limpia caché.\n• Verifica tu conexión.\n• Puede ser intermitencia temporal: estamos trabajando en ello.",
    followups: ["¿Desde cuándo ocurre?", "¿Probaste limpiar caché/cookies?"],
    actions: { addTags: ["kb_conectividad"], controlTag: "kb_conectividad", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["conectividad"]
  },
  {
    id: "monedas_tc",
    categoria: "Monedas y tipo de cambio",
    triggers: ["campos requeridos tipo de cambio", "documento en dolares", "moneda dolar peso"],
    response:
      "Mensaje de tipo de cambio:»\n• Selecciona la moneda correcta.\n• Cambia a MXN y vuelve a la moneda original.\n• Estamos corrigiendo esta falla; si persiste, comparte captura.",
    actions: { addTags: ["kb_monedas"], controlTag: "kb_monedas", maxResponses: 2, priority: "medium", assignTeamId: 1 },
    tags: ["monedas"]
  },
  {
    id: "cancelacion_cfdi",
    categoria: "Cancelación de facturas",
    triggers: ["no puedo cancelar", "factura cancelada en sat pero activa", "proceso de cancelacion"],
    response:
      "Para cancelar:»\n• Revisa estatus en SAT.\n• Usa motivo 02 si aplica.\n• Asegúrate de que no tenga documentos relacionados.\n• Tu usuario necesita permiso de cancelación.",
    actions: { addTags: ["kb_cancelacion"], controlTag: "kb_cancelacion", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["cancelacion"]
  },
  {
    id: "ade",
    categoria: "ADE (Administrador de Documentos Electrónicos)",
    triggers: ["ade no funciona", "no descarga xml desde ade", "subir documentos pasivos", "engrapado de polizas"],
    response:
      "ADE/SAT:»\n• El SAT puede fallar por captcha o carga: intenta más tarde.\n• Verifica RFC activo.\n• Prueba en otro navegador.\n• Para engrapado/subida, comparte folio y captura del error.",
    actions: { addTags: ["kb_ade"], controlTag: "kb_ade", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["ade"]
  },
  {
    id: "nomina",
    categoria: "Nómina",
    triggers: ["isr incorrecto", "no aplica subsidio", "error timbrado nominas"],
    response:
      "Nómina:»\n• Revisa configuración del empleado.\n• Verifica tablas ISR actualizadas.\n• Confirma días trabajados del periodo.\n• Ajusta parámetros si aplica.",
    actions: { addTags: ["kb_nomina"], controlTag: "kb_nomina", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["nomina"]
  },
  {
    id: "complementos_pago",
    categoria: "Complementos de pago",
    triggers: ["no puedo generar complemento de pago", "estado iniciado", "error aplicacion de pagos"],
    response:
      "Complemento de pago:»\n• La factura debe estar terminada y no cancelada.\n• RFC emisor y receptor deben coincidir.\n• Verifica que no exista un complemento previo.\n• Configura correctamente la forma de pago.",
    actions: { addTags: ["kb_complemento_pago"], controlTag: "kb_complemento_pago", maxResponses: 3, priority: "medium", assignTeamId: 1 },
    tags: ["complementos"]
  },
  {
    id: "inventario_productos",
    categoria: "Inventario y productos",
    triggers: ["producto no aparece en punto de venta", "saldos incorrectos inventario", "alta de productos"],
    response:
      "Inventario/Productos:»\n• Sincroniza nuevamente el POS.\n• Verifica que el producto esté activo.\n• Revisa el almacén asignado y existencias.",
    actions: { addTags: ["kb_inventario"], controlTag: "kb_inventario", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["inventario"]
  },
  {
    id: "csd",
    categoria: "Certificados digitales (CSD)",
    triggers: ["error csd", "certificados vencidos", "actualizar certificados"],
    response:
      "CSD:»\n• Renueva tus certificados en el SAT si vencieron.\n• Sube .cer y .key con la contraseña correcta.\n• Vigencia típica: 4 años.",
    actions: { addTags: ["kb_csd"], controlTag: "kb_csd", maxResponses: 3, priority: "medium", assignTeamId: 1 },
    tags: ["csd"]
  },
  {
    id: "clientes_proveedores",
    categoria: "Clientes y proveedores",
    triggers: ["no puedo dar de alta clientes", "problemas rfc clientes", "duplicados clientes"],
    response:
      "Altas de clientes:»\n• Verifica RFC (para extranjeros usa XEXX010101000).\n• Evita duplicados.\n• Completa todos los campos obligatorios.",
    actions: { addTags: ["kb_clientes"], controlTag: "kb_clientes", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["clientes"]
  },
  {
    id: "contabilidad",
    categoria: "Contabilidad",
    triggers: ["polizas no se generan", "saldos incorrectos contabilidad", "cuentas contables"],
    response:
      "Contabilidad:»\n• Revisa la configuración de cuentas contables.\n• Evita usar cuenta 000.\n• Configura el catálogo de cuentas y conceptos contables.",
    actions: { addTags: ["kb_contabilidad"], controlTag: "kb_contabilidad", maxResponses: 3, priority: "medium", assignTeamId: 1 },
    tags: ["contabilidad"]
  },
  {
    id: "membresias",
    categoria: "Membresías y renovaciones",
    triggers: ["renovar membresia", "facturacion membresias", "vencimiento membresias"],
    response:
      "Membresías:»\n• Genero la línea de pago para renovación si la requieres.\n• Se activan automáticamente al pagar.\n• Envíame el comprobante para activación manual si no se refleja.\n• Vigencia: anual.",
    actions: { addTags: ["kb_membresias"], controlTag: "kb_membresias", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["membresias"]
  },
  {
    id: "reportes_exportacion",
    categoria: "Reportes y exportación",
    triggers: ["no exporta a excel", "problemas reportes ventas", "errores generacion reportes"],
    response:
      "Reportes/Excel:»\n• Prueba con un rango de fechas menor.\n• Usa otro navegador.\n• Puede ser una falla temporal en la exportación.",
    actions: { addTags: ["kb_reportes"], controlTag: "kb_reportes", maxResponses: 3, priority: "medium", assignTeamId: 1 },
    tags: ["reportes"]
  },
  {
    id: "diot",
    categoria: "DIOT",
    triggers: ["diot no genera 54 campos", "archivo txt diot", "errores diot"],
    response:
      "DIOT:»\n• Usa la plantilla 006 (54 campos).\n• Regenera el archivo con la configuración vigente.\n• Verifica que tengas la versión más reciente.",
    actions: { addTags: ["kb_diot"], controlTag: "kb_diot", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["diot"]
  },
  {
    id: "notas_credito",
    categoria: "Notas de crédito",
    triggers: ["nota de credito no timbra", "no genera poliza", "no se refleja saldo cliente"],
    response:
      "Notas de crédito:»\n• Verifica que la factura original esté activa.\n• Revisa configuración contable de notas.\n• Liga la nota a la factura original.\n• Confirma motivo correcto si aplica cancelación.",
    actions: { addTags: ["kb_notas_credito"], controlTag: "kb_notas_credito", maxResponses: 3, priority: "medium", assignTeamId: 1 },
    tags: ["notas_credito"]
  },
  {
    id: "cortes_luz",
    categoria: "Cortes de luz y recuperación",
    triggers: ["despues de corte de energia", "no abre el sistema", "reconfiguracion"],
    response:
      "Tras corte de energía:»\n• Reconfigura la conexión al servidor si aplica.\n• Verifica red y modem/router.\n• Reinstala el POS si quedó corrupto.\n• Si sigue, compártenos captura y hora del incidente.",
    actions: { addTags: ["kb_recuperacion"], controlTag: "kb_recuperacion", maxResponses: 2, priority: "high", assignTeamId: 1 },
    tags: ["recuperacion"]
  },
  {
    id: "permisos_usuario",
    categoria: "Permisos de usuario",
    triggers: ["no tengo permisos", "acceso a modulos", "configuracion de permisos faltantes"],
    response:
      "Permisos:»\n• Solicita al administrador otorgar permisos necesarios.\n• Verifica tu perfil de usuario.\n• Configura accesos en Administración → Usuarios.\n• Cada módulo requiere permisos específicos.",
    actions: { addTags: ["kb_permisos"], controlTag: "kb_permisos", maxResponses: 3, priority: "high", assignTeamId: 1 },
    tags: ["permisos"]
  },
  {
    id: "otros",
    categoria: "Otros",
    triggers: ["otro", "diferente", "no sé", "no entiendo"],
    response: "¿Podrías explicar mejor el problema que estás experimentando?",
    actions: { addTags: ["kb_otro"], controlTag: "kb_otro", maxResponses: 1, priority: "high", assignTeamId: 1 },
    tags: ["otro"]
  },
];

// Helper: mapea números del menú a categorías (opcional)
export const MENU_MAP: Record<string, string> = {
  "1": "timbrado",
  "2": "activacion_timbres",
  "3": "punto_venta",
  "4": "descargas_xml_pdf",
  "5": "sistema_conectividad",
  "6": "monedas_tc",
  "7": "cancelacion_cfdi",
  "8": "ade",
  "9": "nomina",
  "10": "complementos_pago",
  "11": "inventario_productos",
  "12": "csd",
  "13": "clientes_proveedores",
  "14": "contabilidad",
  "15": "membresias",
  "16": "reportes_exportacion",
  "17": "diot",
  "18": "notas_credito",
  "19": "cortes_luz",
  "20": "permisos_usuario",
  "21": "otros"
};

// decide si usar GPT según si encontramos match o no
export function shouldUseGPT(userText: string, kb: KBEntry[]): boolean {
  return findKBEntry(userText, kb) === null;
}

export const CHATWOOT_URL = "https://app.chatwoot.com";
export const ACCOUNT_ID = "132018";
export const PERSONAL_TOKEN = "F2zAjGZ82fXq9Z1SVVWHDFGa";
export const BOT_TOKEN = "auBNsnPBgPGZCpKwy2bXpWZz";

export const PERMANENT_TAGS = [
  "soporte_facturacion",
  "timbres",
  "pos",
  "descargas",
  "conectividad",
  "monedas",
  "cancelacion",
  "ade",
  "nomina",
  "complementos",
  "inventario",
  "csd",
  "clientes",
  "contabilidad",
  "membresias",
  "reportes",
  "diot",
  "notas_credito",
  "recuperacion",
  "permisos",
  "otros"
];

export const TEMP_SEMI_PERMANENT_TAGS = [
  "kb_timbrado",
  "kb_timbres",
  "kb_pos",
  "kb_descargas",
  "kb_conectividad",
  "kb_monedas",
  "kb_cancelacion",
  "kb_ade",
  "kb_nomina",
  "kb_complemento_pago",
  "kb_inventario",
  "kb_csd",
  "kb_clientes",
  "kb_contabilidad",
  "kb_membresias",
  "kb_reportes",
  "kb_diot",
  "kb_notas_credito",
  "kb_recuperacion",
  "kb_permisos",
  "kb_otro"
];


export const TEMP_NORMAL_TAGS = [
  "error", 
  "consulta", 
  "pendiente", 
  "revision", 
  "validacion"
];

export const TEMP_TAGS = [
  "solicitar_folio",
  "solicitar_captura",
  "solicitar_factura_pago",
  "solicitar_comprobante",
  "solicitar_permisos"
];

export const SMALL_TALK_TRIGGERS = [
  "hola",
  "saludos",
  "buenas",
  "buenas noches",
  "buenas tardes",
  "buenos días",
  "buenas madrugadas",
  "qué tal",
  "qué pasa",
  "cómo estás",
  "cómo va"
];