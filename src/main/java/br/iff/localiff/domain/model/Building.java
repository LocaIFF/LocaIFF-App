package main.java.br.iff.localiff.domain.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "buildings")
@Data
@NoArgsConstructor 
@AllArgsConstructor
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;          // Ex.: "S", "A", "BIB"

    @Column(nullable = false, length = 100)
    private String nome;            // Ex.: "Bloco S - Salas de Aula"

    @Column(length = 255)
    private String descricao;
}

