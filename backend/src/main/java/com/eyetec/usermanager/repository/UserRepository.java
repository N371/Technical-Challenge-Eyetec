package com.eyetec.usermanager.repository;

import com.eyetec.usermanager.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final JdbcTemplate jdbc;

    // ── RowMapper ─────────────────────────────────────────────────────────────
    private static final RowMapper<User> ROW_MAPPER = (rs, rowNum) -> User.builder()
            .id(rs.getLong("id"))
            .nome(rs.getString("nome"))
            .email(rs.getString("email"))
            .cpf(rs.getString("cpf"))
            .telefone(rs.getString("telefone"))
            .fotoPath(rs.getString("foto_path"))
            .faceDescriptor(rs.getString("face_descriptor"))
            .criadoEm(rs.getString("criado_em"))
            .build();

    // ── Listar com paginação ──────────────────────────────────────────────────
    public List<User> findAll(int offset, int limit) {
        return jdbc.query(
                "SELECT * FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
                ROW_MAPPER, limit, offset);
    }

    public int count() {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        return n != null ? n : 0;
    }

    // ── Buscar por id ─────────────────────────────────────────────────────────
    public Optional<User> findById(Long id) {
        List<User> rows = jdbc.query(
                "SELECT * FROM users WHERE id = ?", ROW_MAPPER, id);
        return rows.stream().findFirst();
    }

    // ── Buscar por email (usado no login) ─────────────────────────────────────
    public Optional<User> findByEmail(String email) {
        List<User> rows = jdbc.query(
                "SELECT * FROM users WHERE email = ?", ROW_MAPPER, email);
        return rows.stream().findFirst();
    }

    // ── Inserir ───────────────────────────────────────────────────────────────
    public User insert(User u) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO users (nome, email, cpf, telefone, foto_path, face_descriptor) " +
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, u.getNome());
            ps.setString(2, u.getEmail());
            ps.setString(3, u.getCpf());
            ps.setString(4, u.getTelefone());
            ps.setString(5, u.getFotoPath());
            ps.setString(6, u.getFaceDescriptor());
            return ps;
        }, keyHolder);

        long newId = keyHolder.getKey().longValue();
        return findById(newId).orElseThrow();
    }

    // ── Atualizar ─────────────────────────────────────────────────────────────
    // COALESCE garante que, se não veio novo valor, mantém o anterior no banco
    public Optional<User> update(Long id, User u) {
        int affected = jdbc.update(
                "UPDATE users SET " +
                "  nome            = ?, " +
                "  email           = ?, " +
                "  cpf             = ?, " +
                "  telefone        = ?, " +
                "  foto_path       = COALESCE(?, foto_path), " +
                "  face_descriptor = COALESCE(?, face_descriptor) " +
                "WHERE id = ?",
                u.getNome(), u.getEmail(), u.getCpf(), u.getTelefone(),
                u.getFotoPath(), u.getFaceDescriptor(), id);

        if (affected == 0) return Optional.empty();
        return findById(id);
    }

    // ── Deletar ───────────────────────────────────────────────────────────────
    public boolean delete(Long id) {
        return jdbc.update("DELETE FROM users WHERE id = ?", id) > 0;
    }

    // ── Auxiliares ────────────────────────────────────────────────────────────
    public Optional<String> findFotoPath(Long id) {
        return findById(id).map(User::getFotoPath);
    }
}
