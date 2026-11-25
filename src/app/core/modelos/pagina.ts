/**
 * Uma página de resultados. Espelha o PaginaResponse<T> do backend.
 * <T> é um "genérico", como no Java: PaginaResponse<Produto> = página de produtos.
 */
export interface PaginaResponse<T> {
  conteudo: T[];
  /** Número da página, começando em 0. */
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}
