package br.iff.localiff.api.controller;

import br.iff.localiff.api.dto.PathRequestDTO;
import br.iff.localiff.api.dto.PathResponseDTO;
import br.iff.localiff.domain.model.Node;
import br.iff.localiff.domain.repository.NodeRepository;
import br.iff.localiff.domain.service.route.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;
    private final NodeRepository nodeRepository;

    /**
     * Calcula rota do quiosque (origem fixa) até o destino informado.
     * Body: { "destinationCode": "sala-201", "onlyAccessible": false }
     */
    @PostMapping("/routes")
    public ResponseEntity<PathResponseDTO> calcularRota(@RequestBody PathRequestDTO request) {
        PathResponseDTO response = routeService.calcularRota(request);
        return ResponseEntity.ok(response);
    }

    /** Lista todos os nós, opcionalmente filtrados por andar. */
    @GetMapping("/nodes")
    public ResponseEntity<List<NodeDTO>> listNodes(
            @RequestParam(required = false) Integer andar) {
        List<Node> nodes = (andar != null)
                ? nodeRepository.findByAndar(andar)
                : nodeRepository.findAll();

        List<NodeDTO> dtos = nodes.stream().map(NodeDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    // ── DTO interno para listagem de nós ──
    public record NodeDTO(Long id, String codigo, String nome, String tipo,
                          int andar, double xPercent, double yPercent,
                          boolean acessivelPcd, String descricao) {
        static NodeDTO from(Node n) {
            return new NodeDTO(n.getId(), n.getCodigo(), n.getNome(), n.getTipo(),
                    n.getAndar(), n.getXPercent(), n.getYPercent(),
                    n.isAcessivelPcd(), n.getDescricao());
        }
    }
}
