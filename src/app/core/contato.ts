/**
 * Dados de contato da loja, num lugar só. O site Vue antigo repetia o número do WhatsApp em 5 lugares.
 * Mudou o número? Muda aqui.
 */
export const CONTATO = {
  nome: 'BRUMIPRESENTES PERFUMADOS',
  descricao: ['Cestas e Presentes Personalizados 💕', 'Kits e Mimos'],
  cidade: 'Rio Claro SP',
  /** Só dígitos, com o código do país (55) e o DDD. É o formato que o wa.me exige. */
  whatsapp: '5519991337245',
  whatsappExibicao: '(19) 99133-7245',
  instagram: 'https://www.instagram.com/brumipresentes/',
} as const;

/**
 * Link do WhatsApp, opcionalmente com uma mensagem já escrita.
 * encodeURIComponent: troca espaços, acentos e aspas por códigos que podem ir numa URL.
 */
export function linkWhatsapp(mensagem?: string): string {
  const base = `https://wa.me/${CONTATO.whatsapp}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
