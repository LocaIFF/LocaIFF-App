package main.java.br.iff.localiff.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "edges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "origem_id")
    private Node origem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destino_id")
    private Node destino;

    @Column(nullable = false)
    private double peso;            // distância ou custo da aresta

    @Column(nullable = false)
    private boolean bidirecional;   // true se for mão dupla

    @Column(nullable = false)
    private boolean acessivelPcd;   // trecho acessível?
}
