package main.java.br.iff.localiff.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "nodes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;          // "s001", "aud1", etc.

    @Column(nullable = false, length = 100)
    private String nome;            // "Sala 001", "Auditório Principal"

    @Column(nullable = false, length = 30)
    private String tipo;            // SALA, CORREDOR, ESCADA, ELEVADOR...

    @Column(nullable = false)
    private int andar;              // 0 = térreo, 1 = 1º andar...

    @Column(nullable = false)
    private double x;               // coordenada X no mapa

    @Column(nullable = false)
    private double y;               // coordenada Y no mapa

    @Column(nullable = false)
    private boolean acessivelPcd;   // local acessível?

    @Column(length = 255)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;      // bloco ao qual o local pertence
}

