package main.java.br.iff.localiff.domain.service.route;

import br.com.localiff.api.dto.PathRequestDTO;
import br.com.localiff.api.dto.PathResponseDTO;
import br.com.localiff.domain.model.Edge;
import br.com.localiff.domain.model.Node;
import br.com.localiff.domain.repository.EdgeRepository;
import br.com.localiff.domain.repository.NodeRepository;
import br.com.localiff.domain.service.RouteService;
import org.springframework.stereotype.Service;

import java.lang.annotation.Inherited;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RouteServiceImpl implements RouteService {

    @Injected
    private EdgeRepository edgeRepository;

    @Injected
    private NodeRepository nodeRepository;

    @Injected
    private BuildingRepository buildingRepository;


    @Override
    public PathResponseDTO calcularRota(PathRequestDTO request) {
        
        Long origemId = request.getOrigemId();
        Long destinoId = request.getDestinoId();
        boolean onlyAccessible = request.isOnlyAccessible();

        // ------------ CAMADA DE REPOSITORY ------------
        // aqui eu só chamo métodos do repository
        List<Node> nodes = nodeRepository.findAll();
        List<Edge> edges = edgeRepository.findAll();
        // ----------------------------------------------

        Map<Long, Node> nodeMap = nodes.stream().collect(Collectors.toMap(Node::getId, n -> n));

        if (!nodeMap.containsKey(origemId) || !nodeMap.containsKey(destinoId)) {
           
            throw new IllegalArgumentException("Origem ou destino inválidos");
        }

        Map<Long, List<Adjacency>> adj = buildAdjacencyList(edges, onlyAccessible);

        DijkstraResult result = dijkstra(adj, origemId, destinoId);

        List<Long> path = reconstructPath(result.previous, origemId, destinoId);

        PathResponseDTO response = new PathResponseDTO();
        response.setNodeIds(path);
        response.setDistanciaTotal(
                result.distance.getOrDefault(destinoId, Double.POSITIVE_INFINITY)
        );
        return response;
        // ----------------------------------------------
    }

    // ======= classes e métodos privados (só no Service) =======

    private static class Adjacency {
        
        Long neighborId;
        double weight;

        Adjacency(Long neighborId, double weight) {
            this.neighborId = neighborId;
            this.weight = weight;
        }
    }

    private Map<Long, List<Adjacency>> buildAdjacencyList(List<Edge> edges, boolean onlyAccessible) {
        
        Map<Long, List<Adjacency>> adj = new HashMap<>();

        for (Edge edge : edges) {
            if (onlyAccessible && !edge.isAcessivelPcd()) {
                continue;
            }
            Long origemId = edge.getOrigem().getId();
            Long destinoId = edge.getDestino().getId();
            double peso = edge.getPeso();

            adj.computeIfAbsent(origemId, k -> new ArrayList<>())
               .add(new Adjacency(destinoId, peso));

            if (edge.isBidirecional()) {
                adj.computeIfAbsent(destinoId, k -> new ArrayList<>())
                   .add(new Adjacency(origemId, peso));
            }
        }

        return adj;
    }

    private static class DijkstraResult {
       
        Map<Long, Double> distance;
        Map<Long, Long> previous;

        DijkstraResult(Map<Long, Double> distance, Map<Long, Long> previous) {
            this.distance = distance;
            this.previous = previous;
        }
    }

    private DijkstraResult dijkstra(Map<Long, List<Adjacency>> adj,
                                    Long origemId,
                                    Long destinoId) {

        Map<Long, Double> dist = new HashMap<>();
        Map<Long, Long> prev = new HashMap<>();

        PriorityQueue<long[]> pq =
                new PriorityQueue<>(Comparator.comparingDouble(a -> a[1]));

        // inicializar distâncias
        for (Long nodeId : adj.keySet()) {
            dist.put(nodeId, Double.POSITIVE_INFINITY);
        }
        dist.put(origemId, 0.0);

        pq.offer(new long[]{origemId, 0L});

        while (!pq.isEmpty()) {
            long[] curr = pq.poll();
            Long currentId = curr[0];

            if (currentId.equals(destinoId)) {
                break;
            }

            double currentDist = dist.getOrDefault(currentId, Double.POSITIVE_INFINITY);
            List<Adjacency> neighbors = adj.getOrDefault(currentId, List.of());

            for (Adjacency adjNode : neighbors) {
                Long neighborId = adjNode.neighborId;
                double newDist = currentDist + adjNode.weight;

                if (newDist < dist.getOrDefault(neighborId, Double.POSITIVE_INFINITY)) {
                    dist.put(neighborId, newDist);
                    prev.put(neighborId, currentId);
                    pq.offer(new long[]{neighborId, (long) newDist});
                }
            }
        }

        return new DijkstraResult(dist, prev);
    }

    private List<Long> reconstructPath(Map<Long, Long> previous,
                                       Long origemId,
                                       Long destinoId) {
        List<Long> path = new ArrayList<>();
        Long current = destinoId;

        if (!origemId.equals(destinoId) && !previous.containsKey(destinoId)) {
            return path;
        }

        while (current != null) {
            path.add(current);
            if (current.equals(origemId)) break;
            current = previous.get(current);
        }

        Collections.reverse(path);
        return path;
    }
}

