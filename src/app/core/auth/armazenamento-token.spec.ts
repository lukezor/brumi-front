import { TestBed } from '@angular/core/testing';
import { ArmazenamentoToken } from './armazenamento-token';

describe('ArmazenamentoToken', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const servico = () => TestBed.inject(ArmazenamentoToken);

  it('começa sem token', () => {
    expect(servico().obter()).toBeNull();
    expect(servico().temToken()).toBe(false);
  });

  it('salva o token do login e o devolve enquanto não vence', () => {
    servico().salvar({ accessToken: 'abc', tokenType: 'Bearer', expiresIn: 86400 });

    expect(servico().obter()).toBe('abc');
    expect(servico().temToken()).toBe(true);
    expect(JSON.parse(localStorage.getItem('brumi.token')!).valor).toBe('abc');
  });

  it('lembra o token de uma visita anterior (lê o localStorage ao iniciar)', () => {
    localStorage.setItem('brumi.token', JSON.stringify({ valor: 'antigo', expiraEm: Date.now() + 3_600_000 }));
    expect(servico().obter()).toBe('antigo');
  });

  it('token vencido (ou a menos de 30 s de vencer) conta como ausente e é apagado', () => {
    servico().salvar({ accessToken: 'quase', tokenType: 'Bearer', expiresIn: 10 });

    expect(servico().obter()).toBeNull();
    expect(servico().temToken()).toBe(false);
    expect(localStorage.getItem('brumi.token')).toBeNull();
  });

  it('limpar() apaga o token', () => {
    servico().salvar({ accessToken: 'abc', tokenType: 'Bearer', expiresIn: 86400 });
    servico().limpar();
    expect(servico().obter()).toBeNull();
    expect(localStorage.getItem('brumi.token')).toBeNull();
  });

  it('ignora conteúdo estragado no localStorage', () => {
    localStorage.setItem('brumi.token', '{isto não é json');
    expect(servico().obter()).toBeNull();
  });
});
