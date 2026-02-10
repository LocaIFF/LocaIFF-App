package br.iff.localiff.domain.service.route;

import br.iff.localiff.api.dto.PathRequestDTO;
import br.iff.localiff.api.dto.PathResponseDTO;

public interface RouteService {

    PathResponseDTO calcularRota(PathRequestDTO request);
}

