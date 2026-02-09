-- ============================================================
--  LocaIFF — Seed de dados: Blocos, Nós (salas + corredores +
--  escadas + quiosque) e Arestas que formam o grafo de rotas.
--
--  Coordenadas em porcentagem (0–100) sobre a planta de cada
--  andar, compatíveis com o front-end (xPercent / yPercent).
--
--  Para adicionar um novo corredor ou sala:
--    1. Insira o nó em `nodes` com coordenadas, andar e tipo.
--    2. Insira arestas em `edges` ligando o novo nó aos nós
--       adjacentes (use bidirecional = true para mão dupla).
--    3. Reinicie o servidor — as rotas já serão recalculadas.
-- ============================================================

-- ── Blocos ──
INSERT INTO buildings (id, codigo, nome, descricao) VALUES
(1, 'A', 'Bloco A', 'Salas de aula e laboratórios'),
(2, 'B', 'Bloco B', 'Bloco administrativo'),
(3, 'C', 'Bloco C', 'Auditórios e coworking');

-- ══════════════════════════════════════════════════════════════
--  NODES — pontos do grafo
--  tipo: QUIOSQUE | CORREDOR | SALA | ESCADA
-- ══════════════════════════════════════════════════════════════

-- ── Térreo (andar = 0) ──
INSERT INTO nodes (id, codigo, nome, tipo, andar, x_percent, y_percent, acessivel_pcd, descricao, building_id) VALUES
-- Quiosque — origem fixa de todas as rotas
( 1, 'kiosk',     'Quiosque',        'QUIOSQUE', 0, 50.0, 85.0, true,  'Posição fixa do tablet',          1),
-- Corredores principais do térreo
( 2, 'cor-T-01',  'Corredor T-01',   'CORREDOR', 0, 50.0, 75.0, true,  'Corredor principal — entrada',    1),
( 3, 'cor-T-02',  'Corredor T-02',   'CORREDOR', 0, 50.0, 65.0, true,  'Corredor principal — interseção', 1),
( 4, 'cor-T-03',  'Corredor T-03',   'CORREDOR', 0, 50.0, 55.0, true,  'Corredor principal — centro',     1),
( 5, 'cor-T-04',  'Corredor T-04',   'CORREDOR', 0, 50.0, 48.0, true,  'Corredor principal — norte',      1),
-- Ramal para sala 101
( 6, 'cor-T-05',  'Ramal T-05',      'CORREDOR', 0, 38.0, 65.0, true,  'Ramal oeste (para sala 101)',     1),
( 7, 'cor-T-06',  'Ramal T-06',      'CORREDOR', 0, 28.0, 67.0, true,  'Ramal oeste cont.',               1),
-- Salas térreo (coordenadas = hotspots.js)
( 8, 'sala-101',  'Sala 101',        'SALA',     0, 22.0, 68.0, true,  'Sala de atendimento geral',       1),
( 9, 'sala-102',  'Lab de TI',       'SALA',     0, 48.0, 55.0, true,  'Laboratório equipado',            1),
-- Escada térreo
(10, 'esc-T',     'Escada Térreo',   'ESCADA',   0, 50.0, 43.0, false, 'Escada para 1º andar',            1),

-- ── 1º Andar (andar = 1) ──
(11, 'esc-1',     'Escada 1º',       'ESCADA',   1, 50.0, 43.0, false, 'Escada vindo do térreo',          2),
(12, 'cor-1-01',  'Corredor 1-01',   'CORREDOR', 1, 50.0, 45.0, true,  'Corredor principal 1º andar',     2),
-- Ramal para sala 201
(13, 'cor-1-02',  'Ramal 1-02',      'CORREDOR', 1, 40.0, 43.0, true,  'Ramal oeste 1º andar',            2),
(14, 'sala-201',  'Sala 201',        'SALA',     1, 30.0, 40.0, true,  'Sala de reuniões',                2),
-- Ramal para sala 202
(15, 'cor-1-03',  'Ramal 1-03',      'CORREDOR', 1, 58.0, 47.0, true,  'Ramal leste 1º andar',            2),
(16, 'sala-202',  'Sala 202',        'SALA',     1, 65.0, 50.0, true,  'Escritório administrativo',       2),
-- Escada 1→2
(17, 'esc-1-2',   'Escada 1→2',      'ESCADA',   1, 50.0, 38.0, false, 'Escada para 2º andar',            2),

-- ── 2º Andar (andar = 2) ──
(18, 'esc-2',     'Escada 2º',       'ESCADA',   2, 50.0, 38.0, false, 'Escada vindo do 1º andar',        3),
(19, 'cor-2-01',  'Corredor 2-01',   'CORREDOR', 2, 50.0, 40.0, true,  'Corredor principal 2º andar',     3),
-- Ramal para sala 301
(20, 'cor-2-02',  'Ramal 2-02',      'CORREDOR', 2, 45.0, 37.0, true,  'Ramal oeste 2º andar',            3),
(21, 'sala-301',  'Sala 301',        'SALA',     2, 40.0, 35.0, true,  'Auditório principal',             3),
-- Ramal para sala 302
(22, 'cor-2-03',  'Ramal 2-03',      'CORREDOR', 2, 60.0, 48.0, true,  'Ramal leste 2º andar',            3),
(23, 'cor-2-04',  'Ramal 2-04',      'CORREDOR', 2, 68.0, 55.0, true,  'Ramal leste cont.',               3),
(24, 'sala-302',  'Sala 302',        'SALA',     2, 75.0, 60.0, true,  'Coworking',                       3);


-- ══════════════════════════════════════════════════════════════
--  EDGES — conexões entre nós (arestas do grafo)
--  peso ≈ distância euclidiana entre coordenadas percentuais
-- ══════════════════════════════════════════════════════════════

INSERT INTO edges (id, origem_id, destino_id, peso, bidirecional, acessivel_pcd) VALUES
-- ── Térreo ──
( 1,  1,  2,  10.0, true, true),   -- kiosk → cor-T-01
( 2,  2,  3,  10.0, true, true),   -- cor-T-01 → cor-T-02
( 3,  3,  6,  12.0, true, true),   -- cor-T-02 → ramal T-05 (bifurcação oeste)
( 4,  6,  7,  10.2, true, true),   -- ramal T-05 → ramal T-06
( 5,  7,  8,   6.1, true, true),   -- ramal T-06 → sala-101
( 6,  3,  4,  10.0, true, true),   -- cor-T-02 → cor-T-03
( 7,  4,  9,   2.0, true, true),   -- cor-T-03 → sala-102 (ao lado do corredor)
( 8,  4,  5,   7.0, true, true),   -- cor-T-03 → cor-T-04
( 9,  5, 10,   5.0, true, true),   -- cor-T-04 → escada térreo

-- ── Térreo → 1º Andar (escada) ──
(10, 10, 11,  15.0, true, false),  -- esc-T → esc-1 (escada, NÃO PcD)

-- ── 1º Andar ──
(11, 11, 12,   2.0, true, true),   -- esc-1 → cor-1-01
(12, 12, 13,  10.2, true, true),   -- cor-1-01 → ramal 1-02
(13, 13, 14,  10.4, true, true),   -- ramal 1-02 → sala-201
(14, 12, 15,   8.2, true, true),   -- cor-1-01 → ramal 1-03
(15, 15, 16,   7.6, true, true),   -- ramal 1-03 → sala-202
(16, 12, 17,   7.0, true, true),   -- cor-1-01 → escada 1→2

-- ── 1º Andar → 2º Andar (escada) ──
(17, 17, 18,  15.0, true, false),  -- esc-1-2 → esc-2

-- ── 2º Andar ──
(18, 18, 19,   2.0, true, true),   -- esc-2 → cor-2-01
(19, 19, 20,   5.8, true, true),   -- cor-2-01 → ramal 2-02
(20, 20, 21,   5.4, true, true),   -- ramal 2-02 → sala-301
(21, 19, 22,  12.8, true, true),   -- cor-2-01 → ramal 2-03
(22, 22, 23,  10.6, true, true),   -- ramal 2-03 → ramal 2-04
(23, 23, 24,   8.6, true, true);   -- ramal 2-04 → sala-302
