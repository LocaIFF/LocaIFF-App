package br.iff.localiff.domain.repository;

import br.iff.localiff.domain.model.Node;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NodeRepository extends JpaRepository<Node, Long> {

    Optional<Node> findByCodigo(String codigo);

    List<Node> findByAndar(int andar);

    List<Node> findByBuildingId(Long buildingId);
}

