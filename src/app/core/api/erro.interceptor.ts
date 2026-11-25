import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ArmazenamentoToken } from '../auth/armazenamento-token';
import { paraErroApi } from './erro-api';

/**
 * Trata os erros de TODAS as respostas:
 *
 * 1. Converte o erro do Angular (HttpErrorResponse) no nosso ErroApi, com a mensagem que a API mandou.
 * 2. 401 numa requisição que levava token: o token venceu (ou foi invalidado). Apaga o token.
 *    - Se era uma LEITURA (GET), repete UMA vez sem o token. As leituras são públicas, então o visitante não
 *      vê erro só porque o navegador guardou um token velho. (Na Task 7 vimos que a API recusa um token
 *      inválido até em rota pública.)
 *    - Se era uma ESCRITA, devolve o 401: a tela do admin (Task 15) leva ao login.
 *
 * Diferente do api.js antigo, ele NÃO redireciona para /admin em todo 401: quem decide para onde ir é a tela.
 *
 * catchError e throwError são operadores do RxJS: "se este fluxo der erro, faça isto".
 */
export const erroInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(ArmazenamentoToken);

  return next(req).pipe(
    catchError((erro: unknown) => {
      if (!(erro instanceof HttpErrorResponse)) {
        return throwError(() => erro);
      }
      if (erro.status === 401 && req.headers.has('Authorization')) {
        tokens.limpar();
        if (req.method === 'GET') {
          return next(semToken(req)).pipe(
            catchError((outro: unknown) =>
              throwError(() => (outro instanceof HttpErrorResponse ? paraErroApi(outro) : outro)),
            ),
          );
        }
      }
      return throwError(() => paraErroApi(erro));
    }),
  );
};

function semToken(req: HttpRequest<unknown>): HttpRequest<unknown> {
  return req.clone({ headers: req.headers.delete('Authorization') });
}
