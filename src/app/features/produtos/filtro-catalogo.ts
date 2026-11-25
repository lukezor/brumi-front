import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FiltroProduto } from '../../core/modelos/produto';

/** O que o formulário de filtros guarda. */
export interface FiltroFormulario {
  busca: string;
  categorias: number[];
  precoMin: number | null;
  precoMax: number | null;
  ordem: string;
}

/** Opções do "Ordenar por". O valor é o "sort" que a API entende (Task 6). */
export const OPCOES_ORDEM = [
  { valor: 'nome,asc', rotulo: 'Nome (A-Z)' },
  { valor: 'nome,desc', rotulo: 'Nome (Z-A)' },
  { valor: 'preco,asc', rotulo: 'Menor preço' },
  { valor: 'preco,desc', rotulo: 'Maior preço' },
  { valor: 'id,desc', rotulo: 'Mais recentes' },
] as const;

/** Produtos por página (o mesmo do site antigo). */
export const POR_PAGINA = 12;

/** Quanto esperar o usuário parar de digitar antes de buscar. */
export const ESPERA_DIGITACAO_MS = 300;

export const FILTRO_INICIAL: FiltroFormulario = {
  busca: '',
  categorias: [],
  precoMin: null,
  precoMax: null,
  ordem: 'nome,asc',
};

/** Converte o formulário + página nos parâmetros da API. O que está vazio não vai. */
export function paraFiltroApi(filtro: FiltroFormulario, pagina: number): FiltroProduto {
  const busca = filtro.busca.trim();
  return {
    nome: busca || undefined,
    categorias: filtro.categorias.length > 0 ? filtro.categorias : undefined,
    precoMin: filtro.precoMin ?? undefined,
    precoMax: filtro.precoMax ?? undefined,
    sort: filtro.ordem,
    page: pagina,
    size: POR_PAGINA,
  };
}

/** Dois filtros pedem a mesma coisa à API? (espaços nas pontas da busca não contam) */
export function mesmoFiltro(a: FiltroFormulario, b: FiltroFormulario): boolean {
  return JSON.stringify(paraFiltroApi(a, 0)) === JSON.stringify(paraFiltroApi(b, 0));
}

/**
 * Validador do GRUPO (olha dois campos juntos): o preço mínimo não pode ser maior que o máximo.
 * Um validador é uma função que devolve null (tudo certo) ou um objeto com o nome do erro.
 * ≈ uma regra de Bean Validation de classe no Java.
 */
export const faixaDePrecoValida: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const minimo = grupo.get('precoMin')?.value as number | null;
  const maximo = grupo.get('precoMax')?.value as number | null;
  return minimo !== null && maximo !== null && minimo > maximo ? { faixaDePreco: true } : null;
};
