import { Categoria } from './categoria';

/**
 * Produto como a API devolve. Espelha o ProdutoResponse do backend.
 * "string | null": o campo existe, mas pode vir vazio (null) do Java.
 */
export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  /** Decimal com 2 casas (BigDecimal no Java). Pode ser null: produto sem preço. */
  preco: number | null;
  ativo: boolean;
  categorias: Categoria[];
  /** Caminhos relativos à API, ex.: "/uploads/3f2a....png". Use urlImagem() para montar o <img src>. */
  imagens: string[];
}

/** Corpo do POST /api/produtos (criação). Espelha o ProdutoRequest. */
export interface ProdutoRequest {
  nome: string;
  descricao?: string | null;
  preco?: number | null;
  /** Obrigatório, pode ser vazio. */
  categoriasIds: number[];
}

/**
 * Corpo do PUT /api/produtos/{id} (alteração PARCIAL). Espelha o ProdutoUpdateRequest.
 * Partial<...>: todos os campos ficam opcionais. Campo ausente = "não alterar".
 */
export type ProdutoUpdateRequest = Partial<{
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  /** Substitui TODAS as categorias. Lista vazia remove todas. */
  categoriasIds: number[];
}>;

/** Filtros e paginação de GET /api/produtos. Tudo opcional: o que faltar, a API usa o padrão. */
export interface FiltroProduto {
  nome?: string;
  categorias?: number[];
  precoMin?: number;
  precoMax?: number;
  /** Padrão da API: true (só os ativos). */
  ativo?: boolean;
  /** Página, começando em 0. */
  page?: number;
  /** Itens por página (padrão 20, máximo 100). */
  size?: number;
  /** "id", "nome" ou "preco", opcionalmente com ",asc" ou ",desc". Ex.: "preco,desc". */
  sort?: string;
}
