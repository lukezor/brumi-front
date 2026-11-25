import { FormControl, FormGroup } from '@angular/forms';
import { faixaDePrecoValida, FILTRO_INICIAL, mesmoFiltro, paraFiltroApi } from './filtro-catalogo';

describe('filtro do catálogo', () => {
  it('formulário vazio vira só ordenação e página', () => {
    expect(paraFiltroApi(FILTRO_INICIAL, 0)).toEqual({
      nome: undefined,
      categorias: undefined,
      precoMin: undefined,
      precoMax: undefined,
      sort: 'nome,asc',
      page: 0,
      size: 12,
    });
  });

  it('leva os filtros preenchidos, sem espaços nas pontas da busca', () => {
    const api = paraFiltroApi({ busca: '  cesta ', categorias: [1, 3], precoMin: 0, precoMax: 200, ordem: 'preco,desc' }, 2);
    expect(api).toMatchObject({ nome: 'cesta', categorias: [1, 3], precoMin: 0, precoMax: 200, sort: 'preco,desc', page: 2 });
  });

  it('espaços a mais na busca não contam como filtro diferente', () => {
    expect(mesmoFiltro({ ...FILTRO_INICIAL, busca: 'cesta' }, { ...FILTRO_INICIAL, busca: ' cesta  ' })).toBe(true);
    expect(mesmoFiltro({ ...FILTRO_INICIAL, busca: 'cesta' }, { ...FILTRO_INICIAL, busca: 'kit' })).toBe(false);
  });

  it('o validador recusa mínimo maior que o máximo', () => {
    const grupo = (min: number | null, max: number | null) =>
      new FormGroup(
        { precoMin: new FormControl<number | null>(min), precoMax: new FormControl<number | null>(max) },
        { validators: faixaDePrecoValida },
      );
    expect(grupo(100, 10).hasError('faixaDePreco')).toBe(true);
    expect(grupo(10, 100).valid).toBe(true);
    expect(grupo(50, 50).valid).toBe(true);
    expect(grupo(100, null).valid).toBe(true);
  });
});
