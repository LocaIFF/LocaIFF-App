package br.iff.localiff.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nodes")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(nullable = false)
    private int andar;

    @Column(name = "x_percent", nullable = false)
    private double xPercent;

    @Column(name = "y_percent", nullable = false)
    private double yPercent;

    @Column(name = "acessivel_pcd", nullable = false)
    private boolean acessivelPcd;

    @Column(length = 255)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;
}

