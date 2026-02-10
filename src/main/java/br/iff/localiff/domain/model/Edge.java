package br.iff.localiff.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "edges")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "origem_id")
    private Node origem;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "destino_id")
    private Node destino;

    @Column(nullable = false)
    private double peso;

    @Column(nullable = false)
    private boolean bidirecional;

    @Column(name = "acessivel_pcd", nullable = false)
    private boolean acessivelPcd;
}
