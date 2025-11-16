## Índice rápido
1. [Front-end](#front-end)
2. [Back-end](#back-end)

---

## Front-end

### ✨ Destaques do cliente

| Status | Funcionalidade | Detalhes |
| --- | --- | --- |
| ✅ | Navegação multicapas | Plantas em PNG alta resolução com zoom/pan via [`components/MapViewer`](src/components/MapViewer.js) e `react-zoom-pan-pinch`. |
| ✅ | Hotspots interativos | Pontos definidos em [`data/hotspots.js`](src/data/hotspots.js), filtrados por camada e exibidos com destaque + tooltip. |
| ✅ | Painel lateral contextual | [`components/InfoPanel`](src/components/InfoPanel.js) mostra descrição, metadata e ações de rota/hotspot favorito. |
| ⚠️ | Rotas simuladas | Mock em [`api.requestRoute`](src/api.js) renderizado por [`utils/routeUtils`](src/utils/routeUtils.js); substituível por API real. |
| 🗺️ | Busca textual + voz | [`components/SearchBar`](src/components/SearchBar.js) + botão de voz (Web Speech API) ligados ao estado global de [`App`](src/App.js). |
| 🔄 | Estado unificado | `App` concentra camada ativa, hotspot selecionado, rota atual e flags de carregamento/erros. |
| 📱 | PWA/Kiosk-ready | Manifesto, ícones e service worker em `public/`, prontos para modo quiosque (Fully Kiosk Browser). |

### Estrutura de diretórios

````plaintext
src
├── App.js                 # Orquestra estados globais e callbacks
├── api.js                 # Cliente Axios + mocks
├── components
│   ├── LayerSelector      # Seleção de blocos/andares
│   ├── MapViewer          # Canvas principal (zoom, hotspots, rotas)
│   ├── InfoPanel          # Painel lateral contextual
│   ├── SearchBar          # Busca com debouncing + voz
│   └── common             # Botões, ícones, helpers reutilizáveis
├── data
│   ├── layers.js          # Metadados de blocos/andares
│   ├── hotspots.js        # Pontos de interesse
│   └── blocks.js          # Agrupamentos e textos institucionais
├── hooks
│   └── useHotspots.js     # Carregamento/cache de hotspots
├── utils
│   ├── routeUtils.js      # Percentual → caminho SVG animável
│   └── formatters.js      # Helpers de texto/tempo/distância
└── index.js               # Bootstrap React + service worker
````

### Fluxo principal

1. `src/index.js` injeta `<App />` e registra o service worker (PWA).
2. `LayerSelector` dispara `onSelectLayer(layerId)`; `App` atualiza `activeLayer`.
3. `MapViewer` filtra hotspots da camada ativa, desenha marcadores e emite `onHotspotSelect`.
4. `InfoPanel` recebe `selectedHotspot`, mostra dados e oferece ações (rota, favoritos).
5. `requestRoute` (mock) é chamado; quando retorna, `route` vira path SVG em `MapViewer`.
6. `SearchBar` e o botão de voz alimentam o mesmo estado filtrado para manter UX consistente.

### Estados centrais (`App.js`)

| Estado | Uso |
| --- | --- |
| `activeLayer` | Planta exibida e filtro de hotspots. |
| `selectedHotspot` | Conteúdo do painel e destaque visual. |
| `route` | Lista de pontos percentuais convertidos em polilinhas. |
| `isPanelOpen`, `isLoadingRoute`, `errorMessage` | Feedback de UI. |
| `hotspots` (`useHotspots`) | Cache e filtragem baseados em camada. |

### Dados configuráveis

- `public/maps/*.png`: plantas por andar (podem ser atualizadas sem rebuild).
- `src/data/layers.js`: ordem, nomes e assets das camadas.
- `src/data/hotspots.js`: `id`, `layerId`, `coordinates` (%), descrição, tags, metadados (capacidade, acessibilidade, recursos).
- `.env`:
  ````bash
  REACT_APP_API_BASE_URL=http://localhost:3001/api
  REACT_APP_MAP_TILE_PATH=/maps
  ````

### Tooling e scripts

| Comando | Função |
| --- | --- |
| `npm start` | Dev server CRA com fast refresh. |
| `npm run build` | Bundle otimizado em `build/`. |
| `npm run serve` | Pré-visualiza o bundle (serve). |
| `npm test` | Jest + React Testing Library. |
| `npm run lint` | ESLint (React + JSX a11y). |

### Uso em modo kiosk

1. Gerar build (`npm run build`) e hospedar (Vercel, Netlify, Nginx local).
2. Configurar Fully Kiosk Browser em tablets: modo imersivo, reload automático, bloqueio de gestos.
3. Ajustar brilho/timeout físico e programar limpeza de cache para prevenir burn-in e travamentos prolongados.

---

## Back-end

### Situação atual

- Não existe API definitiva; `src/api.js` simula respostas com Axios + `setTimeout`.
- Contratos já definidos permitem substituição rápida por um servidor real (Node/Express ou Fastify).
- Banco planejado: PostgreSQL + PostGIS + pgRouting (rotas Dijkstra/A* e perfis acessíveis).

### Contratos consumidos pelo front

- **Hotspot**
  ````json
  {
    "id": "lab-305",
    "layerId": "bloco-a-3",
    "name": "Laboratório 305",
    "type": "Laboratório",
    "description": "Equipado com impressoras 3D",
    "coordinates": { "xPercent": 52.4, "yPercent": 31.7 },
    "metadata": {
      "capacity": 20,
      "resources": ["Projetor", "Ar-condicionado"],
      "accessibility": ["Elevador mais próximo: Bloco A"]
    }
  }
  ````
- **Rota**
  ````json
  {
    "id": "route-lab-305",
    "from": "entrada-principal",
    "to": "lab-305",
    "pointsPercent": [
      { "xPercent": 5, "yPercent": 80 },
      { "xPercent": 18, "yPercent": 64 },
      { "xPercent": 35, "yPercent": 52 }
    ],
    "distanceMeters": 210,
    "estimatedTimeSeconds": 180,
    "profile": "default"
  }
  ````

### Endpoints recomendados

| Método | Rota | Responsabilidade |
| --- | --- | --- |
| `GET /api/layers` | Lista blocos/andares com ordem, nomes e assets. |
| `GET /api/hotspots` | Suporta filtros (`layerId`, `type`) e fornece POIs. |
| `GET /api/hotspots/:id` | Detalhes completos para o painel. |
| `POST /api/routes` | Recebe `{ from, to, profile }` e retorna rota compatível. |
| `GET /api/health` | Health check para CI/monitoramento. |

### Arquitetura proposta

````plaintext
server
├── src
│   ├── index.ts            # Bootstrap Express/Fastify
│   ├── routes              # Definições HTTP
│   ├── controllers         # Orquestram validação + serviços
│   ├── services            # Lógica (rotas com pgRouting, cache)
│   ├── repositories        # PostgreSQL/PostGIS
│   ├── schemas             # Zod/Joi para contratos
│   └── config              # Env, logger (pino), CORS
├── tests                   # Jest + Supertest
└── Dockerfile              # Multi-stage (build + runtime slim)
````

- **Banco:** PostgreSQL + PostGIS para armazenar polígonos/planta e grafo de caminhos. `pgRouting` calcula rotas (Dijkstra/A*), permitindo ponderar escadas vs. rampas.
- **Serviços:** Implementam perfis (`default`, `acessível`, `rápido`), retornam tempo/distância e steps textuais.
- **Cache:** Redis para hotspots estáticos e rotas populares.
- **Segurança:** CORS restrito (`http://localhost:3000` em dev), headers seguros e logs estruturados (pino → Loki/Elastic).
- **Auth (futuro):** JWT/API Key caso a API seja exposta externamente.

### Integração com o front

````javascript
// filepath: c:\Users\joaop\OneDrive\Área de Trabalho\LocaIFF-App\src\api.js
// ...existing code...
export async function requestRoute(payload) {
  const { data } = await http.post('/routes', payload);
  return data;
}
// ...existing code...
export async function fetchHotspotsFromApi(layerId) {
  const { data } = await http.get('/hotspots', { params: { layerId } });
  return data;
}
// ...existing code...
````

1. Configure `.env` do front com `REACT_APP_API_BASE_URL`.
2. Habilite CORS no servidor.
3. Garanta que os schemas de resposta coincidam com os usados pelo front (testes de contrato).
4. Monte pipeline CI (GitHub Actions) rodando lint/testes do front + back, e build Docker multi-stage para deploy.

### Roadmap back-end

| Fase | Entregável | Observações |
| --- | --- | --- |
| **Agora** | API Node/Express com dados mockados persistidos em JSON/DB leve | Elimina mocks do front. |
| **Curto prazo** | Integração PostgreSQL/PostGIS + pgRouting | Rotas reais, distância/tempo confiáveis. |
| **Médio prazo** | Painel administrativo (CRUD de hotspots/rotas) | Pode ser outro front ou CMS headless. |
| **Longo prazo** | Telemetria/analytics (rotas mais usadas, salas populares) | Fornece insights para gestão do campus. |

---

Licença sob [MIT](LICENSE). Contribuições são bem-vindas: abra issues com contexto claro, envie PRs com lint/testes passando e mantenha commits objetivos (PT ou EN, mas consistentes).
````
