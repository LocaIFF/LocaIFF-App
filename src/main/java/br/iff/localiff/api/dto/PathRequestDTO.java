package br.iff.localiff.api.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PathRequestDTO {

    /** Código do hotspot de destino, ex.: "sala-201" */
    private String destinationCode;

    /** Se true, retorna apenas rotas acessíveis (sem escadas) */
    private boolean onlyAccessible;
}
