package main.java.br.iff.localiff.domain.repository;

import br.com.localiff.domain.model.Edge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EdgeRepository extends JpaRepository<Edge, Long> {

    // Ex.: arestas de um building (se tratar por bloco)
    List<Edge> findByOrigemBuildingIdAndDestinoBuildingId(Long origemBuildingId, Long destinoBuildingId);
}

