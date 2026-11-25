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
 */
export function provideLocalizacaoBrasil(): Provider[] {
  registerLocaleData(localePt, 'pt-BR');
  return [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ];
}
