package main.java.br.iff.localiff.domain.repository;

import br.com.localiff.domain.model.Node;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NodeRepository extends JpaRepository<Node, Long> {

    // Ex.: listar nós de um building específico (se precisar)
    List<Node> findByBuildingId(Long buildingId);
}

