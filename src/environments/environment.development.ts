// Configuracao de DESENVOLVIMENTO (usada pelo "ng serve").
// O angular.json troca o environment.ts por este arquivo na configuracao "development" (fileReplacements).
export const environment = {
  producao: false,
  // Vazio de proposito: as chamadas vao para o proprio ng serve (http://localhost:4200/api/...),
  // e o proxy.conf.json as repassa para a API em http://localhost:8080. Sem CORS em desenvolvimento.
  apiUrl: '',
};
