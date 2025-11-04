# Lugaiff – Mapa Interativo em React

Projeto React (CRA + Tailwind) para visualizar mapas PNG com suporte a zoom/pan, múltiplos andares, hotspots clicáveis e painel informativo com gatilhos para integração de rotas e backend SQL via API.

## Principais recursos

- React 18 + react-zoom-pan-pinch para zoom, pan e suporte a toque (gestos pinch/drag).
- TailwindCSS para estilização rápida e responsiva.
- Hotspots referenciados por coordenadas percentuais (xPercent, yPercent), fáceis de manter.
- Painel InfoPanel com botão “Solicitar rota” chamando mock em `src/api.js`.
- Placeholder SVG para desenhar rotas fornecidas pelo backend.
- Estrutura comentada com `// TODO` e `/* EDITAR: ... */` indicando pontos de customização.

## Estrutura

```
public/
  maps/           <-- coloque aqui os PNGs (ex.: terreo.png)
src/
  components/     <-- MapViewer, LayerSelector, InfoPanel
  data/           <-- layers.js, hotspots.js (dados de exemplo)
  utils/          <-- routeUtils.js (conversões e placeholder de rotas)
```

## Instruções de execução

```bash
npm install
npm start
```

- Acesse `http://localhost:3000`.
- Para build de produção: `npm run build`.

## Onde editar

- **Imagens dos mapas:** coloque seus PNGs em `public/maps/` e atualize caminhos em `src/data/layers.js` (`/* EDITAR */`).
- **Hotspots:** ajuste percentuais e textos em `src/data/hotspots.js`. Percentuais são relativos à largura/altura da imagem (0 a 100).
- **Integração backend:** substituir mocks em `src/api.js` pelas chamadas reais (`/* EDITAR: colocar URL do backend */`).
- **Rotas reais:** retornar `pointsPercent` via API (lista ordenada) para desenhar a linha SVG em `MapViewer`.

## Próximos passos sugeridos

- Conectar com API SQL (Node/Express, .NET etc.) expondo endpoints `GET /layers`, `GET /hotspots`, `POST /routes`.
- Implementar algoritmo de rota (Dijkstra/A*) em `routeUtils.js` ou no backend.
- Melhorar UX mobile: personalizar `touch-action`, fullscreen e botões maiores.

## PWA e deploy

- Para transformar em PWA: adicionar ícones e service worker (CRA: usar `npm run build` + `serve`, ajustar `manifest.json`).
- Hospedagem recomendada:
  - **Vercel:** importar repositório, configurar build com `npm install` + `npm run build`.
  - **Netlify:** arrastar pasta `build/` ou conectar repositório (build command `npm run build`, publish `build`).

Bom desenvolvimento!
