/** Erro de um campo específico (só em erros de validação). Espelha o ErroResponse.ErroCampo do backend. */
export interface ErroCampo {
  campo: string;
  mensagem: string;
}

/** O formato ÚNICO de erro da API. Espelha o ErroResponse do backend. */
export interface ErroResponse {
  status: number;
  erro: string;
  mensagem: string;
  campos?: ErroCampo[];
}
