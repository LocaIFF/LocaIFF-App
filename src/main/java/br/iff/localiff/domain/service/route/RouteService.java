package main.java.br.iff.localiff.domain.service.route;

import br.com.localiff.api.dto.PathRequestDTO;
import br.com.localiff.api.dto.PathResponseDTO;

public interface RouteService {
    
    PathResponseDTO calcularRota(PathRequestDTO request);
}

