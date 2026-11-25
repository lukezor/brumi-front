import { ReferenciaPost } from './post-instagram/post-instagram';

/**
 * Posts do Instagram mostrados na Home. Os mesmos três do site Vue antigo.
 * Para trocar: copie o código do endereço do post (instagram.com/p/<codigo>/ ou /reel/<codigo>/).
 */
export const POSTS_INSTAGRAM: readonly ReferenciaPost[] = [
  { tipo: 'reel', codigo: 'DKqZGZyIgKP' },
  { tipo: 'p', codigo: 'DKqS6d-PzYy' },
  { tipo: 'p', codigo: 'DKk9Iv7PoOO' },
];

/** Quantos produtos aparecem na vitrine. */
export const TAMANHO_VITRINE = 6;
