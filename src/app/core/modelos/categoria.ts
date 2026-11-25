/**
 * Categoria como a API devolve. Espelha o record CategoriaResponse do backend.
 *
 * "interface" só existe no TypeScript: some depois de compilar. Serve para o editor e o compilador
 * avisarem quando você usa um campo que não existe (ex.: categoria.name em vez de categoria.nome).
 * ≈ os DTOs (records) do Java, ou os schemas do Pydantic.
 */
export interface Categoria {
  id: number;
  nome: string;
}
