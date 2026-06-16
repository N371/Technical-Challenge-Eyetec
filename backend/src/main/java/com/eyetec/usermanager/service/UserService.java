package com.eyetec.usermanager.service;

import com.eyetec.usermanager.model.User;
import com.eyetec.usermanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    // ── Listar (paginado) ─────────────────────────────────────────────────────
    public Map<String, Object> listar(int page, int size) {
        int offset = page * size;
        List<User> users = repository.findAll(offset, size)
                .stream()
                .map(this::projetarResposta)
                .toList();
        int total = repository.count();
        return Map.of(
                "content",       users,
                "page",          page,
                "size",          size,
                "totalElements", total,
                "totalPages",    (int) Math.ceil((double) total / size)
        );
    }

    // ── Buscar por id ─────────────────────────────────────────────────────────
    public User buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::projetarResposta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    // ── Criar ─────────────────────────────────────────────────────────────────
    public User criar(String nome, String email, String cpf, String telefone,
                      MultipartFile foto, String faceDescriptor) {

        validarCamposObrigatorios(nome, email, cpf);

        String fotoPath = salvarFoto(foto, null);

        User novo = User.builder()
                .nome(nome.strip())
                .email(email.strip().toLowerCase())
                .cpf(cpf.replaceAll("\\D", ""))
                .telefone(telefone != null ? telefone.strip() : null)
                .fotoPath(fotoPath)
                .faceDescriptor(faceDescriptor)
                .build();

        User salvo = repository.insert(novo);
        return projetarResposta(salvo);
    }

    // ── Atualizar ─────────────────────────────────────────────────────────────
    public User atualizar(Long id, String nome, String email, String cpf, String telefone,
                          MultipartFile foto, String faceDescriptor) {

        User existente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        validarCamposObrigatorios(nome, email, cpf);

        String fotoPath = salvarFoto(foto, existente.getFotoPath());

        User atualizado = User.builder()
                .nome(nome.strip())
                .email(email.strip().toLowerCase())
                .cpf(cpf.replaceAll("\\D", ""))
                .telefone(telefone != null ? telefone.strip() : null)
                .fotoPath(fotoPath)
                .faceDescriptor(faceDescriptor)
                .build();

        return repository.update(id, atualizado)
                .map(this::projetarResposta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao atualizar"));
    }

    // ── Deletar ───────────────────────────────────────────────────────────────
    public void deletar(Long id) {
        String fotoPath = repository.findFotoPath(id).orElse(null);
        boolean removido = repository.delete(id);
        if (!removido) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }
        removerFotoDisco(fotoPath);
    }

    // ── Servir foto em bytes ──────────────────────────────────────────────────
    public byte[] carregarFoto(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (user.getFotoPath() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário sem foto");
        }

        Path path = Paths.get(uploadDir, user.getFotoPath());
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo de foto não encontrado");
        }

        try {
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao ler foto");
        }
    }

    // ── Autenticação facial ───────────────────────────────────────────────────
    /**
     * Retorna o descritor facial salvo para o email informado.
     * O frontend faz a comparação com o rosto capturado em tempo real.
     * Nunca retornamos o descritor em outros endpoints — apenas aqui, para o fluxo de login.
     */
    public Map<String, Object> buscarDescriptorParaLogin(String email) {
        User user = repository.findByEmail(email.strip().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (user.getFaceDescriptor() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Usuário não possui descritor facial cadastrado. Recadastre a foto.");
        }

        // Retorna o mínimo necessário para o frontend fazer a comparação
        return Map.of(
                "id",             user.getId(),
                "nome",           user.getNome(),
                "faceDescriptor", user.getFaceDescriptor()
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Projeta o User para a resposta da API:
     * - monta fotoUrl
     * - indica se tem descriptor
     * - não expõe fotoPath nem faceDescriptor (anotados com @JsonIgnore no modelo)
     */
    private User projetarResposta(User u) {
        if (u.getFotoPath() != null) {
            u.setFotoUrl("/api/users/" + u.getId() + "/foto");
        }
        u.setTemDescriptor(u.getFaceDescriptor() != null);
        return u;
    }

    private void validarCamposObrigatorios(String nome, String email, String cpf) {
        if (nome  == null || nome.isBlank())  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo 'nome' é obrigatório");
        if (email == null || email.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo 'email' é obrigatório");
        if (cpf   == null || cpf.isBlank())   throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo 'cpf' é obrigatório");
    }

    private String salvarFoto(MultipartFile foto, String fotoPathAtual) {
        if (foto == null || foto.isEmpty()) return null;

        removerFotoDisco(fotoPathAtual);

        String extensao   = obterExtensao(foto.getOriginalFilename());
        String nomeArquivo = UUID.randomUUID() + extensao;
        Path   destino     = Paths.get(uploadDir, nomeArquivo);

        try {
            Files.createDirectories(destino.getParent());
            foto.transferTo(destino.toFile());
            log.debug("Foto salva: {}", destino.toAbsolutePath());
            return nomeArquivo;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao salvar foto");
        }
    }

    private void removerFotoDisco(String fotoPath) {
        if (fotoPath == null) return;
        try {
            Files.deleteIfExists(Paths.get(uploadDir, fotoPath));
        } catch (IOException e) {
            log.warn("Não foi possível remover foto: {}", fotoPath);
        }
    }

    private String obterExtensao(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
