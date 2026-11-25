import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, Provider } from '@angular/core';

/**
 * Português do Brasil para os pipes de formatação ({{ preco | currency }}, {{ data | date }}...).
 *
 * Sem isto, o Angular formata no padrão americano: "$199.90". Com isto: "R$ 199,90".
 * registerLocaleData carrega as regras do idioma (vírgula decimal, nomes dos meses...).
 * LOCALE_ID e DEFAULT_CURRENCY_CODE são "tokens de injeção": configurações que os pipes pedem ao Angular.
 *
 * É uma função para ser usada igual no app.config.ts e nos testes.
 *
 * Os textos do paginador (que também vêm em inglês) ficam em shared/paginador-pt.ts, e NÃO aqui: este arquivo é
 * carregado logo de início, e importar o paginador aqui levava o código dele para o pacote inicial (Task 14).
 */
export function provideLocalizacaoBrasil(): Provider[] {
  registerLocaleData(localePt, 'pt-BR');
  return [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ];
}
