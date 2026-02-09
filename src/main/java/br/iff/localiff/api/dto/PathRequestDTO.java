package main.java.br.iff.localiff.api.dto;

public class PathRequestDTO {

    private Long origemId;
    private Long destinoId;
    private boolean onlyAccessible; // true = só rota acessível

    public Long getOrigemId() {
        return origemId;
    }

    public void setOrigemId(Long origemId) {
        this.origemId = origemId;
    }

    public Long getDestinoId() {
        return destinoId;
    }

    public void setDestinoId(Long destinoId) {
        this.destinoId = destinoId;
    }

    public boolean isOnlyAccessible() {
        return onlyAccessible;
    }

    public void setOnlyAccessible(boolean onlyAccessible) {
        this.onlyAccessible = onlyAccessible;
    }
}
