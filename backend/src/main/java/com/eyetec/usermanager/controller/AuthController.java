package com.eyetec.usermanager.controller;

import com.eyetec.usermanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService service;

    /**
     * POST /api/auth/descriptor
     * Body: { "email": "ana@eyetec.com" }
     *
     * Retorna o descritor facial salvo para aquele email.
     * O frontend compara com o rosto capturado ao vivo e decide se autentica.
     *
     * Resposta 200:
     * {
     *   "id": 1,
     *   "nome": "Ana Paula",
     *   "faceDescriptor": "[0.12, 0.34, ...]"   ← JSON do Float32Array[128]
     * }
     */
    @PostMapping("/descriptor")
    public ResponseEntity<Map<String, Object>> buscarDescriptor(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", "Campo 'email' é obrigatório"));
        }

        Map<String, Object> resultado = service.buscarDescriptorParaLogin(email);
        return ResponseEntity.ok(resultado);
    }
}
