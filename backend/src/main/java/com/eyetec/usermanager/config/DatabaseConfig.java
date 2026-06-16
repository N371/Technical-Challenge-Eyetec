package com.eyetec.usermanager.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Slf4j
@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${app.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        criarDiretorioUploads();
        executarSchema();
    }

    private void criarDiretorioUploads() {
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) {
            try {
                Files.createDirectories(dir);
                log.info("Diretório de uploads criado: {}", dir.toAbsolutePath());
            } catch (IOException e) {
                throw new RuntimeException("Não foi possível criar o diretório de uploads: " + dir, e);
            }
        }
    }

    private void executarSchema() {
        // Usa DriverManager diretamente — bypassa o HikariCP para garantir
        // que o DDL seja executado e commitado antes do pool subir
        try (Connection conn = DriverManager.getConnection(datasourceUrl);
             Statement stmt = conn.createStatement()) {

            conn.setAutoCommit(true);

            ClassPathResource resource = new ClassPathResource("schema.sql");
            String sql = resource.getContentAsString(StandardCharsets.UTF_8);

            for (String s : sql.split(";")) {
                String trimmed = s.strip();
                if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                    stmt.execute(trimmed);
                    log.debug("Executado: {}", trimmed.substring(0, Math.min(trimmed.length(), 60)));
                }
            }

            log.info("Schema do banco inicializado com sucesso.");

        } catch (Exception e) {
            throw new RuntimeException("Erro ao inicializar schema do banco", e);
        }
    }
}