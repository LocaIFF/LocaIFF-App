package br.iff.localiff.api.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PathResponseDTO {

    private String routeId;
    private List<RoutePoint> pointsPercent;
    private double distanciaTotal;

    @NoArgsConstructor
    @AllArgsConstructor
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY,
                    getterVisibility = JsonAutoDetect.Visibility.NONE,
                    setterVisibility = JsonAutoDetect.Visibility.NONE)
    public static class RoutePoint {
        private double xPercent;
        private double yPercent;
        private int floor;
    }
}

