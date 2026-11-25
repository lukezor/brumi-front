import { Injectable, Provider } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Textos do paginador do Angular Material em português. Por padrão eles vêm em inglês
 * ("Items per page", "1 – 12 of 30").
 *
 * MatPaginatorIntl é um service do Material. Trocamos a implementação dele por esta.
 * ≈ registrar um @Bean que substitui o padrão do Spring.
 */
@Injectable()
export class PaginadorEmPortugues extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página';
  override nextPageLabel = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primeira página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (pagina: number, tamanho: number, total: number): string => {
    if (total === 0 || tamanho === 0) {
      return `0 de ${total}`;
    }
    const inicio = pagina * tamanho + 1;
    const fim = Math.min(inicio + tamanho - 1, total);
    return `${inicio} – ${fim} de ${total}`;
  };
}

/**
 * Use nos "providers" do COMPONENTE que tem um paginador (e não no app.config.ts), para o código do paginador
 * continuar fora do pacote inicial.
 */
export function providePaginadorEmPortugues(): Provider {
  return { provide: MatPaginatorIntl, useClass: PaginadorEmPortugues };
}
