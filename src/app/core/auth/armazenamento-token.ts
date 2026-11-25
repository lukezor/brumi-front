import { computed, Injectable, signal } from '@angular/core';
import { LoginResponse } from '../modelos/autenticacao';

/** Como o token fica salvo no navegador. */
interface TokenSalvo {
  valor: string;
  /** Momento em que expira, em milissegundos desde 1970 (o formato do Date.now()). */
  expiraEm: number;
}

/** Chave no localStorage. (O site Vue antigo usava "auth_token".) */
const CHAVE = 'brumi.token';

/** Considera o token vencido um pouco ANTES da hora, para não enviar um token que vence no caminho. */
const MARGEM_MS = 30_000;

/**
 * Guarda o token JWT do administrador no localStorage do navegador.
 *
 * @Injectable({ providedIn: 'root' }): um "service" com UMA instância para a aplicação inteira, criada
 * na primeira vez que alguém a pede com inject(). ≈ @Service do Spring, .service() do AngularJS.
 *
 * Usado pelo authInterceptor (para colocar o token nas requisições) e pelo erroInterceptor (para apagá-lo
 * quando vence). Na Task 15, o AuthService usa este serviço para o login e o logout.
 *
 * Cuidado: localStorage pode ser lido por qualquer JavaScript da página. Os prós e contras ficam na Task 15.
 */
@Injectable({ providedIn: 'root' })
export class ArmazenamentoToken {
  /** Signal: quando o token muda (login, logout, vencimento), quem depende dele é avisado. */
  private readonly salvo = signal<TokenSalvo | null>(this.lerDoNavegador());

  /**
   * true se há um token guardado. Atenção: NÃO confere o vencimento sozinho (um signal só muda quando alguém o
   * altera, e não com a passagem do tempo). Para decidir se pode entrar numa página, use obter(), que confere.
   */
  readonly temToken = computed(() => this.salvo() !== null);

  /** O token guardado (sem conferir o vencimento), para ler quem está logado. */
  readonly tokenAtual = computed(() => this.salvo()?.valor ?? null);

  /** Guarda o token recebido no login. */
  salvar(login: LoginResponse): void {
    const token: TokenSalvo = { valor: login.accessToken, expiraEm: Date.now() + login.expiresIn * 1000 };
    localStorage.setItem(CHAVE, JSON.stringify(token));
    this.salvo.set(token);
  }

  /** O token, ou null se não houver ou se já tiver vencido (neste caso, também o apaga). */
  obter(): string | null {
    const token = this.salvo();
    if (!token) {
      return null;
    }
    if (Date.now() >= token.expiraEm - MARGEM_MS) {
      this.limpar();
      return null;
    }
    return token.valor;
  }

  limpar(): void {
    localStorage.removeItem(CHAVE);
    this.salvo.set(null);
  }

  /** Lê o que ficou salvo de uma visita anterior. Conteúdo estragado é descartado. */
  private lerDoNavegador(): TokenSalvo | null {
    try {
      const texto = localStorage.getItem(CHAVE);
      const token = texto ? (JSON.parse(texto) as TokenSalvo) : null;
      return token && typeof token.valor === 'string' && typeof token.expiraEm === 'number' ? token : null;
    } catch {
      return null;
    }
  }
}
