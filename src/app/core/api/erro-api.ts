import { HttpErrorResponse } from '@angular/common/http';
import { ErroCampo, ErroResponse } from '../modelos/erro';

/**
 * O erro que TODAS as chamadas à API entregam às telas. O erroInterceptor converte qualquer
 * HttpErrorResponse (o erro "cru" do Angular) neste formato.
 *
 * Assim uma tela só precisa de: erro.status, erro.message e erro.campos.
 * ≈ as exceções de negócio do backend (RecursoNaoEncontradoException...), do lado do navegador.
 */
export class ErroApi extends Error {
  constructor(
    /** Status HTTP. 0 = nem chegou ao servidor (sem conexão, servidor fora do ar). */
    readonly status: number,
    mensagem: string,
    /** Só em erros de validação (400): quais campos estão errados e por quê. */
    readonly campos: ErroCampo[] = [],
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }

  /** Mensagem de um campo específico, para mostrar embaixo do input do formulário. */
  mensagemDoCampo(campo: string): string | undefined {
    return this.campos.find((c) => c.campo === campo)?.mensagem;
  }
}

const SEM_CONEXAO = 'Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.';

/** Mensagens usadas quando a resposta não traz o formato da nossa API (ex.: o proxy não achou o servidor). */
const MENSAGENS_PADRAO: Record<number, string> = {
  // 0: nem saiu do navegador (sem internet). 502/503/504: quem respondeu foi um intermediário (o proxy do
  // ng serve, ou um servidor web em produção) dizendo que a API está fora do ar ou não respondeu a tempo.
  0: SEM_CONEXAO,
  502: SEM_CONEXAO,
  503: SEM_CONEXAO,
  504: SEM_CONEXAO,
  401: 'Sua sessão expirou ou você não está autenticado.',
  403: 'Você não tem permissão para esta operação.',
  404: 'Não encontrado.',
  413: 'Arquivo grande demais.',
};

/** Converte o erro do Angular no nosso ErroApi, aproveitando o corpo da resposta quando é um ErroResponse. */
export function paraErroApi(erro: HttpErrorResponse): ErroApi {
  const corpo = erro.error as Partial<ErroResponse> | null;
  if (corpo && typeof corpo === 'object' && typeof corpo.mensagem === 'string') {
    return new ErroApi(erro.status, corpo.mensagem, corpo.campos ?? []);
  }
  const mensagem =
    MENSAGENS_PADRAO[erro.status] ??
    (erro.status >= 500 ? 'Ocorreu um erro no servidor. Tente novamente mais tarde.' : 'Não foi possível concluir a operação.');
  return new ErroApi(erro.status, mensagem);
}
