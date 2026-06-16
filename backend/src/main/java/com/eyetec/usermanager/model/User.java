package com.eyetec.usermanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    private Long   id;
    private String nome;
    private String email;
    private String cpf;
    private String telefone;

    /** Caminho relativo do arquivo de foto em disco. Nunca exposto ao frontend. */
    @JsonIgnore
    private String fotoPath;

    /**
     * Vetor facial serializado como JSON (Float32Array[128] do face-api.js).
     * Nunca exposto nas respostas — usado apenas internamente para autenticação.
     */
    @JsonIgnore
    private String faceDescriptor;

    /** ISO-8601 UTC, gravado pelo SQLite. */
    private String criadoEm;

    // ── Campos calculados — não persistem no banco ───────────────────────────

    /** URL pública da foto, montada pelo service. Ex: /api/users/1/foto */
    private String fotoUrl;

    /** true se o usuário já tem descritor facial cadastrado. */
    private boolean temDescriptor;
}
