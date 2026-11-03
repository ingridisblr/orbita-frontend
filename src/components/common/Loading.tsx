
export interface Desafio {
    id: string;
    titulo: string;
    descricao: string;
    status: 'Aberto' | 'Em Análise' | 'Com Ideias';
    area: string;
    ideiasCount: number;
    tags: string[];
}
