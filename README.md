# 🛸 ÓRBITA – Frontend Web

Plataforma corporativa para centralização e gestão de demandas de inovação, desenvolvida no âmbito da **Residência em Software e Inteligência Artificial (Porto Digital - Programa TakeOff)** 

O **ÓRBITA** conecta gargalos operacionais e estratégicos (**Desafios**) a propostas de solução trazidas pelos colaboradores (**Ideias**), utilizando Inteligência Artificial para sugestão de compatibilidade semântica sob governança estrita ***Human-in-the-Loop*** (a IA sugere, mas a decisão final é 100% humana) 

---

## 🚀 Tecnologias e Ferramentas

- **Core Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) 
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Cliente HTTP:** [Axios](https://axios-http.com/) com interceptores para JWT, rate limit (`429`) e fallback de IA (`504`/`502`) 
- **Estilização &amp; UI:** HTML5, CSS3, Tailwind CSS / Material UI (alinhado ao protótipo no Figma Make) 
- **Validação de Formulários:** React Hook Form + Zod / Schema Validation
- **Qualidade &amp; Padronização:** ESLint, Prettier, Husky e Commitlint (Conventional Commits) 
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

* **Node.js** (versão 18+ recomendada)
* **npm** ou **yarn**

### Passo a Passo

1. **Clonar o repositório:**

```
git clone https://github.com/ingridisblr/orbita-frontend.git
cd orbita-frontend

```

1. **Instalar as dependências:**

```
npm install

```

1. **Configurar as Variáveis de Ambiente:** Copie o arquivo `.env.example` para `.env.local`:

```
cp .env.example .env.local

```

Defina a URL base da API Flask:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1

```

1. **Executar o servidor de desenvolvimento:**

```
npm run dev

```

Acesse no navegador: `http://localhost:5173` 

---

## 🧪 Scripts Disponíveis

* `npm run dev` – Inicia o servidor local de desenvolvimento via Vite 
* `npm run build` – Compila o projeto com TypeScript e gera os artefatos de produção em `dist/`.
* `npm run lint` – Executa a verificação estática de código com ESLint 
* `npm run preview` – Visualiza o build de produção localmente.

---

## 📜 Licença e Contexto Acadêmico

Projeto desenvolvido para a entrega do programa **TakeOff – Residência em Software e Inteligência Artificial (Porto Digital)** [2, 3].
