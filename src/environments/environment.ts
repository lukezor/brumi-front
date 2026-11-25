// Configuracao de PRODUCAO (usada pelo "ng build").
// Em desenvolvimento, o angular.json troca este arquivo pelo environment.development.ts.
// Nao coloque segredos aqui: tudo neste arquivo vai para o navegador e qualquer um pode ler.
export const environment = {
  producao: true,
  // Endereco da API. Vazio = mesmo dominio do site (ex.: https://brumi.com.br/api/...).
  // Se a API for publicada em outro endereco, coloque-o aqui (ex.: 'https://api.brumi.com.br').
  apiUrl: '',
};
