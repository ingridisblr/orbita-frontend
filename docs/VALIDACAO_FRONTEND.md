# Validação do frontend ÓRBITA

Data: 14/10/2026 · Node 22 / npm 10.9 · base: `orbita-frontend-main`

## 1. Configuração

| Item | Resultado | Observação |
| --- | --- | --- |
| `npm run build` | ✅ Passou | Antes falhava: `moduleResolution: "node"` não é aceito pelo TypeScript 7. Trocado para `"bundler"`. |
| `npm run lint` | ✅ 0 avisos, 0 erros | oxlint com `jsx-a11y` ativado, 19 arquivos. |
| `.env.example` | ✅ Criado | `VITE_API_URL=http://localhost:5000/api/v1` |
| `.env` no `.gitignore` | ✅ | `.env`, `.env.*`, exceto `.env.example`. |
| `lang` e título | ✅ | `pt-BR` e "ÓRBITA". |
| README | ✅ Atualizado | React 19, oxlint, variável `VITE_API_URL`. |

## 2. Contraste (WCAG 2.1 AA) — calculado
Texto normal exige 4,5:1; bordas de campo e foco exigem 3:1. Todas as 19 combinações passaram. Menores valores:
navy sobre amarelo hover 7,6:1 · texto suave sobre cartão 6,95:1 · perigo sobre branco 6,57:1 · borda de campo 3,07:1.

## 3. Acessibilidade — automatizado
axe-core (WCAG 2 A/AA, 2.1 AA e boas práticas), nas 3 telas, em 1440px e 375px: **0 violações**.
Teclado: primeiro Tab foca "Pular para o conteúdo"; Enter leva o foco ao `<main>`. No menu móvel, Esc fecha e devolve o foco ao botão Menu.

## 4. Responsividade — automatizado
Larguras 320, 375, 768 e 1440px: sem rolagem horizontal. Menu lateral vira painel deslizante abaixo de 1024px.

## 5. Comunicação Frontend ↔ Backend (Passo 3)
Data: 14/10/2026 · Rota: `GET http://localhost:5000/api/v1/health` · Status: **200** · Resposta: `{"status":"ok"}`
- URL lida de `VITE_API_URL` (`.env`); não existe URL fixa no código (`src/services/api.ts`).
- CORS: sem erro no console; o Flask devolve `Access-Control-Allow-Origin` para `http://localhost:5173`.
- Tela "Conexão com a API" mostra rota, status HTTP, tempo e o JSON recebido.
- Falha tratada: com o Flask desligado, a tela mostra a mensagem "Não foi possível falar com a API…".
- Passou: React fez a requisição e recebeu corretamente a resposta do Flask.

## 6. Pendências (precisam de pessoa)
- [ ] Mapear tokens para os **tokens oficiais do BBTS** (a fonte dos tokens não foi fornecida).
- [ ] Testar em celular e tablet reais (iOS Safari e Android Chrome).
- [ ] Teste com leitor de tela (NVDA ou VoiceOver) e Lighthouse no navegador.
- [ ] Aplicar os componentes na tela de login e nas páginas por perfil quando existirem no repositório.
- [ ] Integrar `Layout` e `Sidebar` ao React Router e ao perfil vindo da API (Passos 9 e 10).
