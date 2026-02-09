package main.java.br.iff.localiff.api.dto;

import java.util.List;

public class PathResponseDTO {

    private List<Long> nodeIds;      // sequência de nós (em ordem)
    private double distanciaTotal;   // soma dos pesos da rota

    public PathResponseDTO() {
    }

    public PathResponseDTO(List<Long> nodeIds, double distanciaTotal) {
        this.nodeIds = nodeIds;
        this.distanciaTotal = distanciaTotal;
    }

    public List<Long> getNodeIds() {
        return nodeIds;
    }

    public void setNodeIds(List<Long> nodeIds) {
        this.nodeIds = nodeIds;
    }

    public double getDistanciaTotal() {
        return distanciaTotal;
    }

    public void setDistanciaTotal(double distanciaTotal) {
        this.distanciaTotal = distanciaTotal;
    }
}

