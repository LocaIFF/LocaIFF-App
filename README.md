<div align="center">

# 🗺️ LocaIFF — Mapa Interativo do Campus

**Sistema de navegação indoor para o campus IFF**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://adoptium.net)
[![License](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)](LICENSE)

> 📱 Tablet/quiosque → aluno busca uma sala → sistema calcula a rota mais curta pelo grafo de corredores → rota animada no mapa

</div>

---

## 📑 Índice

- [✨ Visão geral](#-visão-geral)
- [🏗️ Arquitetura](#️-arquitetura)
- [⚙️ Back-end (Spring Boot)](#️-back-end-spring-boot)
- [🎨 Front-end (React)](#-front-end-react)
- [🗄️ Banco de dados e grafo de rotas](#️-banco-de-dados-e-grafo-de-rotas)
- [🚀 Como rodar](#-como-rodar)
- [➕ Como cadastrar novos corredores e salas](#-como-cadastrar-novos-corredores-e-salas)
- [📡 Endpoints da API](#-endpoints-da-api)
- [📋 Roadmap](#-roadmap)

---

## ✨ Visão geral

| Camada      | Stack                                                                 |
| ----------- | --------------------------------------------------------------------- |
| 🎨 Front    | React 18 · Tailwind CSS · react-spring · react-zoom-pan-pinch         |
| ⚙️ Back     | Spring Boot 3.2.5 · Spring Data JPA · Lombok                         |
| 🗄️ Banco    | H2 em memória (dev) — substituível por PostgreSQL                     |
| 🧠 Algoritmo | Dijkstra com suporte a rotas acessíveis (PcD)                        |

O quiosque (tablet) fica **fixo no térreo**. Quando o aluno seleciona uma sala e clica em **"Solicitar rota"**, o front-end envia o código da sala ao back-end, que calcula a **menor rota** pelo grafo de corredores usando **Dijkstra** e retorna a sequência de coordenadas percentuais. O front-end desenha a **rota animada em SVG** sobre a planta do andar.

O sistema é **responsivo** — otimizado para **tablets** (uso principal em quiosques) e também funciona em **celulares**.

---

## 🏗️ Arquitetura

```
┌─────────────────────┐        POST /api/routes         ┌──────────────────────┐
│                     │  ──────────────────────────────► │                      │
│  🎨 React (tablet)  │                                  │  ⚙️ Spring Boot API  │
│     porta 3000      │  ◄────────────────────────────── │     porta 8080       │
│                     │       { pointsPercent[] }        │                      │
└─────────────────────┘                                  └──────────┬───────────┘
                                                                    │
                                                         ┌──────────▼───────────┐
                                                         │  🗄️ H2 Database      │
                                                         │  buildings · nodes · │
                                                         │  edges               │
                                                         └──────────────────────┘
```

**Fluxo completo:**

1. 👆 Aluno toca em uma sala no mapa (ou busca por voz/texto)
2. 📋 `InfoPanel` exibe detalhes da sala
3. 🗺️ Aluno clica em **"Solicitar rota"**
4. 📡 `POST /api/routes` → `{ destinationCode: "sala-201" }`
5. 🧠 Backend roda **Dijkstra** no grafo `(nodes + edges)`
6. 📦 Retorna `pointsPercent[]` com coordenadas `(x%, y%, andar)`
7. 🎯 Frontend filtra pontos pelo andar atual e desenha rota animada em SVG

---

## ⚙️ Back-end (Spring Boot)

### 📂 Estrutura de diretórios

```
src/main/java/br/iff/localiff/
├── 🚀 LocaliffApplication.java         → Bootstrap
├── config/
│   ├── 🔓 SecurityConfig.java          → Desabilita CSRF, permite todas as rotas
│   └── 🌐 WebConfig.java               → CORS liberado para o front-end
├── api/
│   ├── controller/
│   │   └── 🎯 RouteController.java     → REST: /api/routes, /api/nodes, /api/health
│   └── dto/
│       ├── 📥 PathRequestDTO.java      → { destinationCode, onlyAccessible }
│       └── 📤 PathResponseDTO.java     → { routeId, pointsPercent[], distanciaTotal }
└── domain/
    ├── model/
    │   ├── 🏢 Building.java            → @Entity — blocos do campus
    │   ├── 📍 Node.java                → @Entity — nós do grafo
    │   └── 🔗 Edge.java                → @Entity — arestas entre nós
    ├── repository/
    │   ├── BuildingRepository.java      → JpaRepository<Building>
    │   ├── NodeRepository.java          → findByCodigo · findByAndar
    │   └── EdgeRepository.java          → JpaRepository<Edge>
    └── service/route/
        ├── RouteService.java            → Interface
        └── 🧠 RouteServiceImpl.java     → Dijkstra + reconstrução de caminho

src/main/resources/
├── ⚙️ application.properties           → Config H2, porta 8080
└── 🗄️ data.sql                         → Seed: blocos, nós, arestas
```

### 🏢 Entidades

#### Building (Bloco)

| Campo       | Tipo     | Descrição                      |
| ----------- | -------- | ------------------------------ |
| `id`        | `Long`   | PK auto-incremento             |
| `codigo`    | `String` | Código único (`"A"`, `"B"`, `"C"`) |
| `nome`      | `String` | Nome completo do bloco         |
| `descricao` | `String` | Descrição opcional              |

#### 📍 Node (Nó do grafo)

| Campo          | Tipo      | Descrição                                            |
| -------------- | --------- | ---------------------------------------------------- |
| `id`           | `Long`    | PK auto-incremento                                   |
| `codigo`       | `String`  | Código único — **deve coincidir com hotspot ID do front** |
| `nome`         | `String`  | Nome legível                                          |
| `tipo`         | `String`  | `QUIOSQUE` · `CORREDOR` · `SALA` · `ESCADA`          |
| `andar`        | `int`     | `0` = Térreo · `1` = 1º Andar · …                    |
| `xPercent`     | `double`  | Coordenada X no mapa (0–100%)                         |
| `yPercent`     | `double`  | Coordenada Y no mapa (0–100%)                         |
| `acessivelPcd` | `boolean` | O local é acessível para PcD?                         |
| `descricao`    | `String`  | Descrição opcional                                    |
| `building_id`  | `FK`      | Bloco ao qual pertence                                |

#### 🔗 Edge (Aresta)

| Campo          | Tipo      | Descrição                                       |
| -------------- | --------- | ----------------------------------------------- |
| `id`           | `Long`    | PK auto-incremento                              |
| `origem_id`    | `FK`      | Nó de origem                                    |
| `destino_id`   | `FK`      | Nó de destino                                   |
| `peso`         | `double`  | Custo/distância da aresta                       |
| `bidirecional` | `boolean` | `true` = mão dupla (maioria dos corredores)     |
| `acessivelPcd` | `boolean` | `false` para escadas                            |

### 🧠 Algoritmo de rota (Dijkstra)

```
1.  Origem ← nó com codigo = "kiosk" (posição fixa do tablet)
2.  Destino ← nó cujo codigo corresponde ao hotspot.id do front
3.  Carrega todos os nós e arestas do banco
4.  Monta lista de adjacência (respeita bidirecional + filtro PcD)
5.  Executa Dijkstra com PriorityQueue
6.  Reconstrói o caminho (IDs → coordenadas percentuais)
7.  Retorna [ { xPercent, yPercent, floor }, ... ]
```

---

## 🎨 Front-end (React)

### 📂 Estrutura de diretórios

```
frontend/src/
├── 🎛️ App.js                     → Orquestrador de estados e callbacks
├── 📡 api.js                     → Axios → backend + fallback mock
├── 🎨 index.css                  → Tailwind base + glass-surface + animações
├── index.js                      → Bootstrap React
├── components/
│   ├── 🗺️ MapViewer.js           → Zoom/pan, hotspots, rota SVG animada
│   ├── 🔍 SearchBar.js           → Busca textual + comandos de voz (pt-BR)
│   ├── 📋 InfoPanel.js           → Painel lateral com detalhes + ações de rota
│   ├── 📑 LayerSelector.js       → Seletor de andares
│   └── common/
│       ├── GlassSurface.js       → Wrapper glassmorphism
│       ├── RippleButton.js       → Botão com efeito ripple
│       └── AccessibilityToggle.js → Toggle alto contraste
├── data/
│   ├── 📑 layers.js              → Metadados dos andares (Térreo … 7º)
│   └── 📍 hotspots.js            → Pontos de interesse (salas, labs, etc.)
├── hooks/
│   ├── useDebounce.js            → Debounce genérico
│   ├── useHighContrast.js        → Alto contraste com localStorage
│   └── 🎤 useSpeechRecognition.js → Web Speech API (pt-BR)
└── utils/
    └── routeUtils.js             → Converte pontos % → path SVG
```

### 🔄 Fluxo principal

```
 👆 Toque no hotspot       📋 InfoPanel abre         🗺️ "Solicitar rota"
       │                        │                          │
       ▼                        ▼                          ▼
  seleciona sala  ───►  mostra detalhes  ───►  POST /api/routes
                                                       │
                                                       ▼
                                              🧠 Dijkstra no backend
                                                       │
                                                       ▼
                                      📦 pointsPercent[] retornado
                                                       │
                                                       ▼
                                    🎯 Filtra pelo andar → SVG animado
```

### 🎤 Busca por voz

O `SearchBar` suporta **comandos de voz em português** brasileiro:

| 🎙️ Comando          | ⚡ Ação                         |
| -------------------- | ------------------------------ |
| `"andar 3"`          | Navega para o 3º Andar         |
| `"térreo"`           | Navega para o Térreo           |
| `"terceiro andar"`   | Navega para o 3º Andar         |
| `"sala 201"`         | Busca e seleciona a sala 201   |
| qualquer texto       | Filtra hotspots por nome       |

### 📊 Estados centrais (`App.js`)

| Estado                | Uso                                           |
| --------------------- | --------------------------------------------- |
| `currentLayerId`      | Andar sendo exibido no mapa                   |
| `selectedHotspotId`   | Hotspot selecionado → conteúdo do InfoPanel   |
| `routePoints`         | Todos os pontos da rota (todos os andares)    |
| `visibleRoutePoints`  | Pontos filtrados para o andar atual           |
| `isLoadingRoute`      | Flag de carregamento durante requisição       |
| `isInfoClosing`       | Controla animação de saída do painel          |

### 📜 Scripts npm

```bash
cd frontend

npm start       # 🚀 Dev server na porta 3000
npm run build   # 📦 Bundle otimizado em build/
npm test        # 🧪 Jest + React Testing Library
npm run lint    # 🔍 ESLint no código
```

---

## 🗄️ Banco de dados e grafo de rotas

O campus é modelado como um **grafo dirigido ponderado**:

- **📍 Nós** = salas, corredores, escadas, elevadores, quiosque
- **🔗 Arestas** = conexões transitáveis com peso (distância)

### 🌐 Visualização do grafo

```
📍 Quiosque (50, 85)
    │
    │  peso=10
    ▼
📍 Corredor T-01 (50, 75)
    │
    │  peso=10
    ▼
📍 Corredor T-02 (50, 65) ──12──► Ramal T-05 (38, 65) ──10──► Ramal T-06 (28, 67) ──6──► 🏫 Sala 101
    │
    │  peso=10
    ▼
📍 Corredor T-03 (50, 55) ──2──► 🏫 Sala 102 (48, 55)
    │
    │  peso=7
    ▼
📍 Corredor T-04 (50, 48)
    │
    │  peso=5
    ▼
🪜 Escada Térreo (50, 43)
    │
    │  peso=15 (⚠️ NÃO acessível)
    ▼
🪜 Escada 1º (50, 43) ──► Corredor 1-01 ──► ... ──► 🏫 Sala 201 · Sala 202
    │
    │  peso=15
    ▼
🪜 Escada 2º (50, 38) ──► Corredor 2-01 ──► ... ──► 🏫 Sala 301 · Sala 302
```

### 📐 Coordenadas percentuais

Todas as coordenadas são **percentuais (0–100)** sobre a imagem da planta do andar. Isso garante que o front-end possa renderizar os pontos **independente da resolução da imagem**.

**Para definir as coordenadas de um novo nó:**

1. Abra a planta do andar no navegador
2. Use ferramentas de inspeção ou meça manualmente a posição
3. Converta para % (ex.: se a imagem tem 1920px de largura e o ponto está em 960px → `xPercent = 50`)

### 🔧 H2 Console (desenvolvimento)

Acesse `http://localhost:8080/h2-console` para consultar e editar o banco em tempo real:

| Campo      | Valor                    |
| ---------- | ------------------------ |
| JDBC URL   | `jdbc:h2:mem:localiffdb` |
| Username   | `sa`                     |
| Password   | *(vazio)*                |

---

## 🚀 Como rodar

### 📋 Pré-requisitos

| Ferramenta  | Versão mínima | Link                                                    |
| ----------- | ------------- | ------------------------------------------------------- |
| ☕ Java      | 17+           | [Eclipse Temurin](https://adoptium.net)                 |
| 📦 Maven    | 3.8+          | Incluído via `mvnw` (wrapper)                           |
| 🟢 Node.js  | 18+           | [nodejs.org](https://nodejs.org)                        |
| 📦 npm      | 9+            | Vem com o Node.js                                       |

### 1️⃣ Backend

```bash
# Na raiz do projeto (Linux/Mac)
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

✅ Servidor inicia em `http://localhost:8080`
✅ Verificar: `GET http://localhost:8080/api/health` → `"OK"`
✅ H2 Console: `http://localhost:8080/h2-console`

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm start
```

✅ Dev server abre em `http://localhost:3000`
✅ Conecta automaticamente ao backend na porta 8080
✅ Se o backend estiver indisponível → usa **fallback mock** (a UI não quebra)

### 3️⃣ Variáveis de ambiente (opcional)

```bash
# frontend/.env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

---

## ➕ Como cadastrar novos corredores e salas

### 📂 Onde fica a base de dados?

> **📁 Arquivo:** `src/main/resources/data.sql`
>
> Este arquivo contém **todos os blocos, salas, corredores e conexões** do campus.
> Ao iniciar o backend, o H2 executa automaticamente este SQL para popular o banco.
> Edite este arquivo para adicionar/remover/alterar salas e corredores.

### 📝 Passo a passo

#### 1. Adicionar um bloco

```sql
INSERT INTO buildings (id, codigo, nome, descricao) VALUES
(4, 'D', 'Bloco D', 'Novo bloco de laboratórios');
```

#### 2. Adicionar nós (salas + corredores)

```sql
-- 🏫 Sala nova no 3º andar
INSERT INTO nodes (id, codigo, nome, tipo, andar, x_percent, y_percent, acessivel_pcd, descricao, building_id) VALUES
(25, 'sala-401', 'Sala 401', 'SALA', 3, 35.0, 50.0, true, 'Lab de química', 4);

-- 📍 Waypoint no corredor que leva a essa sala
INSERT INTO nodes (id, codigo, nome, tipo, andar, x_percent, y_percent, acessivel_pcd, descricao, building_id) VALUES
(26, 'cor-3-01', 'Corredor 3-01', 'CORREDOR', 3, 50.0, 45.0, true, 'Corredor principal 3º andar', 4);
```

#### 3. Conectar com arestas

```sql
-- 🔗 Liga o corredor à sala
INSERT INTO edges (id, origem_id, destino_id, peso, bidirecional, acessivel_pcd) VALUES
(24, 26, 25, 16.0, true, true);
```

> 💡 **Dica:** o `peso` deve ser aproximadamente a distância euclidiana:
> `peso ≈ √((x₂-x₁)² + (y₂-y₁)²)`

#### 4. Registrar hotspot no front-end

Adicione em `frontend/src/data/hotspots.js`:

```javascript
{
  id: "sala-401",       // ← DEVE coincidir com o `codigo` do nó no banco
  layerId: "third",     // ← DEVE corresponder ao andar (ver layers.js)
  xPercent: 35,
  yPercent: 50,
  label: "401",
  title: "Sala 401",
  block: "Bloco D",
  floorLabel: "3º Andar",
  description: "Laboratório de química."
}
```

#### 5. Reiniciar

```bash
# Backend (recria H2 com os novos dados)
./mvnw spring-boot:run

# Frontend (se editou hotspots.js)
cd frontend && npm start
```

### 🖥️ Via H2 Console (testes rápidos)

Acesse `http://localhost:8080/h2-console`, conecte e execute `INSERT`s diretamente. As rotas são **recalculadas em tempo real** a cada requisição.

### ✅ Checklist para novas salas

- [ ] 📍 Nó da sala inserido em `nodes` com `codigo` = hotspot `id`
- [ ] 📍 Nó(s) de corredor criados para waypoints intermediários
- [ ] 🔗 Arestas conectam sala ao corredor mais próximo
- [ ] 🪜 Se novo andar: nós de escada + aresta entre andares
- [ ] 🎨 Hotspot adicionado em `hotspots.js` com mesmo `id` e coordenadas
- [ ] 📐 `peso` das arestas calculado pela distância euclidiana

---

## 📡 Endpoints da API

| Método   | Rota            | Body / Params                                                | Resposta                                                                     |
| -------- | --------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `POST`   | `/api/routes`   | `{ "destinationCode": "sala-201", "onlyAccessible": false }` | `{ routeId, pointsPercent: [{xPercent, yPercent, floor}], distanciaTotal }`  |
| `GET`    | `/api/nodes`    | `?andar=0` (opcional)                                        | Lista de nós `[{id, codigo, nome, tipo, andar, ...}]`                        |
| `GET`    | `/api/health`   | —                                                            | `"OK"`                                                                       |

### 📝 Exemplo completo — solicitar rota

**Request:**

```bash
curl -X POST http://localhost:8080/api/routes \
  -H "Content-Type: application/json" \
  -d '{"destinationCode": "sala-201", "onlyAccessible": false}'
```

**Response:**

```json
{
  "routeId": "bc4ded82-830f-40a9-9445-acbec36b07e8",
  "pointsPercent": [
    { "xPercent": 50.0, "yPercent": 85.0, "floor": 0 },
    { "xPercent": 50.0, "yPercent": 75.0, "floor": 0 },
    { "xPercent": 50.0, "yPercent": 65.0, "floor": 0 },
    { "xPercent": 50.0, "yPercent": 55.0, "floor": 0 },
    { "xPercent": 50.0, "yPercent": 48.0, "floor": 0 },
    { "xPercent": 50.0, "yPercent": 43.0, "floor": 0 },
    { "xPercent": 50.0, "yPercent": 43.0, "floor": 1 },
    { "xPercent": 50.0, "yPercent": 45.0, "floor": 1 },
    { "xPercent": 40.0, "yPercent": 43.0, "floor": 1 },
    { "xPercent": 30.0, "yPercent": 40.0, "floor": 1 }
  ],
  "distanciaTotal": 79.6
}
```

> ☝️ Note que a rota **cruza andares** — vai do térreo (floor 0) até o 1º andar (floor 1) passando pela escada. O frontend filtra e exibe apenas os pontos do andar atualmente selecionado.

---

## 📋 Roadmap

| Fase               | Entregável                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| ✅ **Concluído**    | API Dijkstra + H2 + seed de corredores · Front com rota animada · Responsivo |
| 🔜 Curto prazo     | Migrar H2 → PostgreSQL · Painel admin CRUD para nós/arestas               |
| 📅 Médio prazo     | Elevadores no grafo · Rotas PcD completas · Múltiplos perfis de rota       |
| 🔮 Longo prazo     | Telemetria (salas mais buscadas) · Integração com sistema acadêmico        |

---

</div>