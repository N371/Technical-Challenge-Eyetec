package com.eyetec.usermanager.controller;

import com.eyetec.usermanager.model.User;
import com.eyetec.usermanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    // ── GET /api/users?page=0&size=10 ────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(service.listar(page, size));
    }

    // ── GET /api/users/{id} ───────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<User> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // ── POST /api/users  (multipart/form-data) ────────────────────────────────
    // @RequestParam (não @RequestPart) para campos de texto: mais tolerante
    // a variações de Content-Type por parte que o FormData do browser gera.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> criar(
            @RequestParam("nome")                               String nome,
            @RequestParam("email")                              String email,
            @RequestParam("cpf")                                String cpf,
            @RequestParam(value = "telefone",       required = false) String telefone,
            @RequestParam(value = "foto",           required = false) MultipartFile foto,
            @RequestParam(value = "faceDescriptor", required = false) String faceDescriptor) {

        User criado = service.criar(nome, email, cpf, telefone, foto, faceDescriptor);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // ── PUT /api/users/{id}  (multipart/form-data) ────────────────────────────
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> atualizar(
            @PathVariable Long id,
            @RequestParam("nome")                               String nome,
            @RequestParam("email")                              String email,
            @RequestParam("cpf")                                String cpf,
            @RequestParam(value = "telefone",       required = false) String telefone,
            @RequestParam(value = "foto",           required = false) MultipartFile foto,
            @RequestParam(value = "faceDescriptor", required = false) String faceDescriptor) {

        User atualizado = service.atualizar(id, nome, email, cpf, telefone, foto, faceDescriptor);
        return ResponseEntity.ok(atualizado);
    }

    // ── DELETE /api/users/{id} ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/users/{id}/foto ──────────────────────────────────────────────
    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> foto(@PathVariable Long id) {
        byte[] bytes = service.carregarFoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(bytes);
    }
}