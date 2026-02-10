package br.iff.localiff.domain.service.route;

import br.iff.localiff.api.dto.PathRequestDTO;
import br.iff.localiff.api.dto.PathResponseDTO;
import br.iff.localiff.api.dto.PathResponseDTO.RoutePoint;
import br.iff.localiff.domain.model.Edge;
import br.iff.localiff.domain.model.Node;
import br.iff.localiff.domain.repository.EdgeRepository;
import br.iff.localiff.domain.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService {

    private static final String KIOSK_CODE = "kiosk";

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;

    @Override
    public PathResponseDTO calcularRota(PathRequestDTO request) {

        // Origem é sempre o quiosque fixo
        Node kiosk = nodeRepository.findByCodigo(KIOSK_CODE)
                .orElseThrow(() -> new RuntimeException("Nó do quiosque não encontrado (codigo='kiosk')"));

        Node destino = nodeRepository.findByCodigo(request.getDestinationCode())
                .orElseThrow(() -> new RuntimeException(
                        "Destino não encontrado: " + request.getDestinationCode()));

        List<Node> allNodes = nodeRepository.findAll();
        List<Edge> allEdges = edgeRepository.findAll();

        Map<Long, Node> nodeMap = allNodes.stream()
                .collect(Collectors.toMap(Node::getId, n -> n));

        Map<Long, List<Adjacency>> adj = buildAdjacencyList(allEdges, request.isOnlyAccessible());

        Set<Long> allIds = nodeMap.keySet();

        DijkstraResult result = dijkstra(adj, kiosk.getId(), destino.getId(), allIds);

        List<Long> pathIds = reconstructPath(result.previous, kiosk.getId(), destino.getId());

        if (pathIds.isEmpty()) {
            throw new RuntimeException("Nenhuma rota encontrada de '"
                    + KIOSK_CODE + "' até '" + request.getDestinationCode() + "'");
        }

        List<RoutePoint> points = pathIds.stream()
                .map(nodeMap::get)
                .filter(Objects::nonNull)
                .map(n -> new RoutePoint(n.getXPercent(), n.getYPercent(), n.getAndar()))
                .collect(Collectors.toList());

        double dist = result.distance.getOrDefault(destino.getId(), 0.0);

        return new PathResponseDTO(UUID.randomUUID().toString(), points, dist);
    }

    // ======================== Dijkstra ========================

    private record Adjacency(Long neighborId, double weight) {}

    private record DijkstraResult(Map<Long, Double> distance, Map<Long, Long> previous) {}

    private Map<Long, List<Adjacency>> buildAdjacencyList(List<Edge> edges, boolean onlyAccessible) {
        Map<Long, List<Adjacency>> adj = new HashMap<>();
        for (Edge e : edges) {
            if (onlyAccessible && !e.isAcessivelPcd()) continue;

            Long oId = e.getOrigem().getId();
            Long dId = e.getDestino().getId();
            double peso = e.getPeso();

            adj.computeIfAbsent(oId, k -> new ArrayList<>()).add(new Adjacency(dId, peso));
            if (e.isBidirecional()) {
                adj.computeIfAbsent(dId, k -> new ArrayList<>()).add(new Adjacency(oId, peso));
            }
        }
        return adj;
    }

    private DijkstraResult dijkstra(Map<Long, List<Adjacency>> adj,
                                    Long origemId, Long destinoId,
                                    Set<Long> allNodeIds) {
        Map<Long, Double> dist = new HashMap<>();
        Map<Long, Long> prev = new HashMap<>();
        Set<Long> visited = new HashSet<>();

        for (Long id : allNodeIds) dist.put(id, Double.MAX_VALUE);
        dist.put(origemId, 0.0);

        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a[1]));
        pq.offer(new double[]{origemId, 0.0});

        while (!pq.isEmpty()) {
            double[] curr = pq.poll();
            long currentId = (long) curr[0];

            if (visited.contains(currentId)) continue;
            visited.add(currentId);
            if (currentId == destinoId) break;

            for (Adjacency a : adj.getOrDefault(currentId, List.of())) {
                if (visited.contains(a.neighborId)) continue;
                double newDist = dist.get(currentId) + a.weight;
                if (newDist < dist.getOrDefault(a.neighborId, Double.MAX_VALUE)) {
                    dist.put(a.neighborId, newDist);
                    prev.put(a.neighborId, currentId);
                    pq.offer(new double[]{a.neighborId, newDist});
                }
            }
        }
        return new DijkstraResult(dist, prev);
    }

    private List<Long> reconstructPath(Map<Long, Long> previous, Long origemId, Long destinoId) {
        if (!origemId.equals(destinoId) && !previous.containsKey(destinoId)) {
            return List.of();
        }
        LinkedList<Long> path = new LinkedList<>();
        Long current = destinoId;
        while (current != null) {
            path.addFirst(current);
            if (current.equals(origemId)) break;
            current = previous.get(current);
        }
        return path;
    }
}

