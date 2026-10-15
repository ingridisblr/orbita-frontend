# 🛸 ÓRBITA – Frontend Web

Plataforma corporativa para centralização e gestão de demandas de inovação, desenvolvida no âmbito da **Residência em Software e Inteligência Artificial (Porto Digital - Programa TakeOff)** 

O **ÓRBITA** conecta gargalos operacionais e estratégicos (**Desafios**) a propostas de solução trazidas pelos colaboradores (**Ideias**), utilizando Inteligência Artificial para sugestão de compatibilidade semântica sob governança estrita ***Human-in-the-Loop*** (a IA sugere, mas a decisão final é 100% humana) 

---

## 🚀 Tecnologias e Ferramentas

- **Core Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) 
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** CSS puro com tokens de design (`src/styles/tokens.css`) e um arquivo CSS por componente
- **Qualidade:** oxlint (com regras de acessibilidade `jsx-a11y`) e Prettier
- **Cliente HTTP:** Axios (`src/services/api.ts`; URL vem de `VITE_API_URL`)
- **Planejado (ainda não instalado):** React Router, React Hook Form + Zod
- **Integração Backend:** API REST Python + Flask | Banco PostgreSQL + `pgvector`

---

## 🛠️ Arquitetura de Pastas (`src/`)

A estrutura do projeto segue o modelo modular previsto para a aplicação :

```text
src/
├── assets/          # Imagens, ícones e recursos visuais estáticos
├── components/      # Componentes reutilizáveis (Botões, Inputs, Modals, Badges)
│   ├── common/      # Layout, Header, Sidebar, Loading, ErrorFallback
│   ├── desafios/    # Cards e formulários do módulo de Desafios
│   ├── ideias/      # Cards e formulários do módulo de Ideias
│   ├── match/       # Card de recomendação da IA e botões de decisão humana
│   └── kanban/      # Quadro, colunas e cards de projetos em execução
├── contexts/        # AuthContext (JWT e controle de acesso por papel)
├── hooks/           # Custom Hooks (useAuth, useMatchIA, useDebounce)
├── pages/           # Telas roteadas da aplicação (Login, Desafios, Ideias, Match, Kanban)
├── services/        # Configuração do Axios, endpoints da API e adaptadores
├── styles/          # Tokens de design e estilos globais
├── types/           # Interfaces TypeScript estáticas (Desafio, Ideia, Match, Triagem)
└── utils/           # Formatadores, parsers e calculadores de score

```

---

## 🔐 Login, perfis e telas (demonstração)

Dois perfis: **Usuário** (colaborador / gestor demandante) e **Administrador** (analista do Hub de Inovação). Todo cadastro novo entra como Usuário; só o administrador promove outra pessoa.

| Tela | Quem acessa | O que faz |
| --- | --- | --- |
| Entrar / Criar conta | Todos | Autenticação |
| Minha área | Usuário | Resumo pessoal e atalhos |
| Desafios (US01) | Todos | Cadastrar, editar, encerrar e excluir desafios; filtrar por situação e área |
| Minhas ideias / Ideias (US02) | Todos | Enviar ideia (com ou sem desafio), acompanhar situação, retirar. O admin vê todas |
| Matches da IA (US03/US07) | Admin | Confirmar ou descartar sugestões pendentes; vínculo manual (fallback) |
| Triagem (US04) | Admin | Notas de 1 a 5 em 4 critérios, parecer, aprovar ou rejeitar |
| Kanban (US05) | Admin | Ideias aprovadas viram projetos: Backlog, Em andamento, MVP, Concluído |
| Dashboard e Auditoria (US06) | Admin | Indicadores e registro das ações |
| Usuários | Admin | Promover, rebaixar e remover contas |

**Admin de teste:** `admin@orbita.com` / `Admin@1234` (criado na primeira execução). O sistema já vem com 2 desafios e 2 ideias de exemplo.

**Atenção, é demonstração:** por enquanto tudo fica no `localStorage` do navegador, sem backend.
- Autenticação: `src/services/authService.ts`
- Desafios, ideias, matches, triagem, kanban e auditoria: `src/services/orbitaStore.ts`
- A "IA" é uma simulação por semelhança de palavras. Quando a API Flask existir, troque o corpo dessas funções por chamadas ao Axios (`src/services/api.ts`); as telas não mudam.
- As permissões só são seguras se o backend também as verificar.

---

## 👥 Personas e Histórias de Usuário (US)

A aplicação atende a três perfis com permissões específicas:

| Persona                        | Papel no Sistema                                                  | Histórias de Usuário (US)                                                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gestor Demandante**          | Cadastra e gerencia os gargalos e problemas da sua área           | **US01:** Cadastrar e gerenciar Desafios                                                                                                                                                                |
| **Colaborador / Proponente**   | Explora desafios e submete propostas de solução                   | **US02:** Submeter e acompanhar Ideias                                                                                                                                                                   |
| **Analista / Hub de Inovação** | Valida sugestões da IA, realiza triagem, aprova e conduz o Kanban | **US03 / US07:** Validar Matches da IA <br />**US04:** Triagem Multicritério (Notas 1 a 5)<br />**US05:** Gerenciar Kanban e MVPs <br />**US06:** Acompanhar Dashboard e Auditoria|

---

## 🔄 Governança de IA (Human-in-the-Loop) e Resiliência

1. **Validação Humana Obrigatória:**
  * As sugestões de compatibilidade semântica geradas pelo backend são exibidas na interface com o status **PENDENTE** 
  * O Analista do Hub possui botões explícitos para **Confirmar** ou **Descartar** a associação. A IA **nunca** altera o status do negócio de forma autônoma 
2. **Tratamento de Indisponibilidade e Fallback:**
  * Em caso de *timeout* do serviço de IA (&gt;10s / `504`), *rate limit* (`429`) ou indisponibilidade (`502`/`503`), o frontend exibe um banner orientando o usuário e libera o **vínculo e triagem manuais**, sem interromper a operação das demais telas 
---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos

* **Node.js** 20 ou superior e **npm** 10 ou superior

### Passo a passo

```bash
git clone https://github.com/seu-usuario/orbita-frontend.git
cd orbita-frontend
npm install
cp .env.example .env      # ajuste VITE_API_URL se a API não estiver em localhost:5000
npm run dev
```

Acesse `http://localhost:5173`. O arquivo `.env` não é versionado.

### Variáveis de ambiente

| Variável       | Exemplo                        | Uso                         |
| -------------- | ------------------------------ | --------------------------- |
| `VITE_API_URL` | `http://localhost:5000/api/v1` | URL base da API Flask       |

---

## 🧪 Scripts Disponíveis

* `npm run dev` – servidor de desenvolvimento (Vite)
* `npm run build` – verifica tipos com `tsc` e gera `dist/`
* `npm run lint` – análise estática com oxlint
* `npm run preview` – serve o build de produção localmente

---

## 🎨 Padrões de interface

* **Tokens:** cores, espaçamentos, tipografia e raios ficam só em `src/styles/tokens.css`. Não use valores soltos nos componentes.
* **Breakpoints:** tablet 640px, desktop 1024px (menu lateral fixo a partir de 1024px).
* **Componentes compartilhados** (`src/components/common`): Button, Input, Textarea, Select, Badge, Alert, Spinner, Sidebar, Layout e Brand. A tela "Guia de componentes" mostra todos.
* **Acessibilidade:** alvo de toque mínimo de 44px, foco visível, link "Pular para o conteúdo", contraste WCAG AA, `prefers-reduced-motion` respeitado. Detalhes em `docs/VALIDACAO_FRONTEND.md`.

---

## 📜 Licença e Contexto Acadêmico

Projeto desenvolvido para a entrega do programa **TakeOff – Residência em Software e Inteligência Artificial (Porto Digital)** [2, 3].
