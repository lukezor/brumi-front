/**
 * Ajudantes SÓ para os testes: simulam um administrador logado.
 * (Não são usados pela aplicação; o build os descarta.)
 */

/** Um JWT falso com o "sub" pedido. A assinatura é inventada: o frontend não a confere (quem confere é a API). */
export function tokenFalso(sub = 'admin'): string {
  const base64url = (objeto: object) =>
    btoa(JSON.stringify(objeto)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${base64url({ alg: 'HS256' })}.${base64url({ iss: 'brumi-api', sub, papel: 'ADMIN' })}.assinatura-falsa`;
}

/** Deixa um token válido por 1 hora no localStorage, como se o login tivesse acontecido numa visita anterior. */
export function entrarComoAdmin(sub = 'admin'): void {
  localStorage.setItem('brumi.token', JSON.stringify({ valor: tokenFalso(sub), expiraEm: Date.now() + 3_600_000 }));
}
