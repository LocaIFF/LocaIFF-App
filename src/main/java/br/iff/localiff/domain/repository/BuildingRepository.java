package main.java.br.iff.localiff.domain.repository;

import br.com.localiff.domain.model.Building;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuildingRepository extends JpaRepository<Building, Long> {
}

