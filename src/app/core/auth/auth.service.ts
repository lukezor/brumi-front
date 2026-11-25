import { computed, inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AutenticacaoApiService } from '../api/autenticacao-api.service';
import { LoginRequest } from '../modelos/autenticacao';
import { ArmazenamentoToken } from './armazenamento-token';

/**
 * Estado da sessão do administrador: entrar, sair, está logado, quem é.
 * Junta a chamada à API (AutenticacaoApiService) com o armazenamento do token (ArmazenamentoToken).
 * ≈ um store de autenticação (Pinia/composable) no Vue; um service de sessão no AngularJS.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AutenticacaoApiService);
  private readonly tokens = inject(ArmazenamentoToken);

  /** Signal: true depois do login, false depois de sair ou de o token ser apagado (401). As telas reagem sozinhas. */
  readonly autenticado = this.tokens.temToken;

  /** Nome do usuário logado, lido de dentro do token (campo "sub"). Só para MOSTRAR na tela. */
  readonly usuario = computed(() => {
    const token = this.tokens.tokenAtual();
    return token ? lerUsuarioDoToken(token) : null;
  });

  /** Faz login e guarda o token. Em caso de erro, o Observable falha com o ErroApi (ex.: 401). */
  login(credenciais: LoginRequest): Observable<void> {
    return this.api.login(credenciais).pipe(
      // tap: "aproveita para fazer algo" com o valor, sem alterá-lo.
      tap((resposta) => this.tokens.salvar(resposta)),
      map(() => undefined),
    );
  }

  /** Apaga o token. Não existe "deslogar" no servidor: um JWT vale até vencer (veja a Task 7). */
  sair(): void {
    this.tokens.limpar();
  }

  /** Confere AGORA, inclusive o vencimento. É o que o guard usa para liberar (ou não) a rota. */
  estaAutenticadoAgora(): boolean {
    return this.tokens.obter() !== null;
  }
}

/**
 * Lê o campo "sub" do meio do JWT (cabeçalho.CONTEÚDO.assinatura).
 * O conteúdo do token é só Base64URL, sem criptografia: qualquer um lê (Task 7). Por isso aqui é usado
 * só para exibir o nome. Quem confia no token é o BACKEND, que confere a assinatura.
 */
export function lerUsuarioDoToken(token: string): string | null {
  try {
    const conteudo = token.split('.')[1];
    const base64 = conteudo.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')));
    return typeof json.sub === 'string' ? json.sub : null;
  } catch {
    return null;
  }
}
