# 📑 Eyetec - Technical Challenge: User Management System

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge)
![Target](https://img.shields.io/badge/Prazo-17%2F06-red?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Arquitetura-Monorepo-blue?style=for-the-badge)
![Database](https://img.shields.io/badge/Persist%C3%AAncia-SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

Este repositório contém a solução completa para o desafio prático de Gestão de Usuários com Captura de Imagem e Rastreio Facial.
---

> [!IMPORTANT]
> **Abordagem de Engenharia (Estratégia Fail-Fast):**
> O cronograma de execução deste projeto foi invertido com base no princípio de mitigação de riscos críticos. Em vez de iniciar pelo desenvolvimento convencional de telas e formulários CRUD, priorizou-se o desenvolvimento dos componentes de maior complexidade e incerteza técnica (Algoritmos de Visão Computacional e Persistência Dinâmica de Dados). Uma vez validados os maiores gargalos de infraestrutura e hardware, as camadas de interface fluem como uma esteira previsível de entrega.

---

## 🗺️ Planejamento Estratégico de Execução

Abaixo está o detalhamento técnico e as justificativas arquiteturais que guiam o ciclo de vida do desenvolvimento até o prazo final.

### 🔴 Fase 1: Visão Computacional, Rastreio Facial e Captura (Front-End Core)
* **Data de Execução:** 12/06 (Sexta-feira)
* **Justificativa de Risco:** Esta é a fase de maior complexidade do projeto por envolver a manipulação direta de hardware através da API nativa do navegador (`navigator.mediaDevices.getUserMedia`) combinada com o processamento matemático assíncrono de modelos de Machine Learning em tempo real no lado do cliente (`face-api.js` / WebGL). O desafio reside em interceptar a stream de vídeo, extrair as coordenadas do *bounding box* facial e calcular as proporções da imagem para retornar feedbacks dinâmicos de enquadramento (rosto muito próximo, muito longe ou descentralizado).
* **Entregáveis:**
  * Componente de captura de fluxo de vídeo funcional e de baixa latência.
  * Canvas de sobreposição gráfica (*overlay*) injetando alertas de enquadramento em tempo real.
  * Módulo de captura capaz de extrair o frame estático da face e convertê-lo em formato Base64/Blob otimizado para tráfego de rede.

### 🟠 Fase 2: Persistência Dinâmica e a "Regra de Ouro" (Back-End Database)
* **Data de Execução:** 13/06 (Sábado)
* **Justificativa de Risco:** O principal critério eliminatório de banco de dados é a geração e a estruturação automática do arquivo local `.db` / `.sqlite` na primeira execução. Falhas de escopo em ambientes isolados de containers ou caminhos relativos mal configurados impedem a inicialização da aplicação do avaliador.
* **Entregáveis:**
  * Configuração automatizada do ORM (Prisma/Sequelize) programada para interceptar o ciclo de vida de inicialização da API, validar o sistema de arquivos local e disparar o esquema DDL (*migrations*) de forma transparente.
  * Modelagem relacional da entidade `User` preparada para indexação eficiente de metadados e ponteiros de arquivos binários de imagem.

### 🟡 Fase 3: Arquitetura do Backend e Rotas REST (Back-End Core)
* **Data de Execução:** 14/06 (Domingo)
* **Justificativa de Risco:** Requer a implementação de uma API REST baseada nos princípios de separação de conceitos (*Separation of Concerns*). O desafio central aqui é o design de armazenamento: persistir as imagens diretamente no SQLite como tipos primitivos binários (`BLOB`) deterioraria drasticamente a performance do arquivo físico de banco de dados a médio prazo. A decisão de arquitetura adotada é persistir os arquivos físicos em um diretório estático e local do servidor, guardando no SQLite apenas as URLs e os caminhos relativos de busca.
* **Entregáveis:**
  * Endpoints REST padronizados e tipados: `POST /users`, `GET /users`, `PUT /users/:id`, `DELETE /users/:id`.
  * Middleware robusto para upload, validação de mimetype e escrita assíncrona de arquivos de imagem no sistema de arquivos local.

### 🟢 Fase 4: Interface do Usuário e Consumo da API (Front-End CRUD)
* **Data de Execução:** 15/06 (Segunda-feira)
* **Justificativa de Risco:** Complexidade baixa. Trata-se de engenharia frontend tradicional de formulários e tabelas. Com a API estável e os módulos da webcam homologados na Fase 1, o escopo se resume em capturar os dados dos inputs de texto, acoplar o arquivo de imagem gerado pela câmera e despachar o payload multipart/form-data via cliente HTTP (`fetch` / `axios`).
* **Entregáveis:**
  * Tela de listagem dinâmica com paginação de usuários cadastrados e renderização dos cards de perfil com foto.
  * Formulário reativo de cadastro e edição de dados integrado ao modal de captura de imagem facial.

### 🔵 Fase 5: Conteinerização, Documentação e Entrega (Infraestrutura)
* **Data de Execução:** 16/06 (Terça-feira)
* **Justificativa de Risco:** Etapa crítica de entrega. Um software com código excelente que falha ao inicializar na máquina do avaliador por incompatibilidade de ambiente ou falta de dependências locais é descartado. O uso de multi-containers Docker abstrai as diferenças de sistemas operacionais e garante comportamento idêntico em qualquer ambiente de execução.
* **Entregáveis:**
  * `Dockerfile` otimizado e focado em multi-stage build para o Frontend e para o Backend.
  * Arquivo `docker-compose.yml` capaz de orquestrar as redes locais dos containers, configurar volumes para a persistência do SQLite e expor as portas unificadas através de um único comando (`docker-compose up --build`).
  * Finalização do guia técnico de instalação passo a passo para a banca avaliadora.

---

## 📈 Roteiro de Commits Semânticos

O histórico do Git reflete rigorosamente a evolução cronológica e o raciocínio de engenharia aplicado ao longo do projeto. Os commits utilizam o padrão *Conventional Commits* para manter o rastro legível:

1. `chore: skeleton structure with frontend and backend folders`
2. `feat(frontend): implement webcam video stream integration and canvas layer`
3. `feat(frontend): integrate face-api.js model for real-time framing feedback` *(Diferencial Concluído)*
4. `feat(backend): configure automated sqlite engine initialization on startup` *(Regra de Ouro Concluída)*
5. `feat(backend): structure layered controller architecture and data schemas`
6. `feat(backend): implement image storage helper and REST API routes`
7. `feat(frontend): implement core management views and form validation`
8. `feat(frontend): connect views to backend endpoints for database operations`
9. `deploy: configure dockerfiles and cross-origin multi-container docker-compose environment`
10. `docs: review and finalize architecture details and installation steps in README.md`


## 🛠️ Tecnologias Utilizadas

* **Frontend:** React, Vite, TypeScript, Axios, TailwindCSS.
* **Backend:** Java 21, Spring Boot 3.3, JdbcTemplate.
* **Banco de Dados:** SQLite (persistido localmente via volumes).
* **Proxy & Servidor Web:** Caddy Server (atuando como proxy reverso e servidor de arquivos estáticos).

---

## 📋 Requisitos Mínimos

Para executar este projeto, o avaliador precisa ter instalado apenas:

1. **Docker** (versão 20.10+ recomendada)
2. **Docker Compose**

*Nota: Não é necessário ter Java, Maven, Node.js ou SQLite instalados fisicamente na máquina, pois tudo é isolado e construído dentro dos contêineres.*

---

## 🚀 Como Executar a Aplicação

Siga os passos abaixo para subir o ambiente completo:

### 1. Clonar o Repositório

git clone https://github.com/N371/Technical-Challenge-Eyetec.git

cd Technical-Challenge-Eyetec 


3. **Inicializar os Contêineres com Docker Compose**
Na raiz do projeto (onde encontra-se o arquivo docker-compose.yml), execute o comando abaixo para realizar o build das imagens e iniciar todos os serviços em segundo plano (detached mode):
docker compose up -d --build


### 2. Acessar a Aplicação via Navegador
Assim que o Docker indicar que todos os contêineres foram iniciados com sucesso (Started), a aplicação estará pronta para uso. Abra o seu navegador de preferência e acesse o endereço:

👉 http://localhost:8081

- Inserir com foto;
- Lista dos usuários inseridos;
- Opção de editar;
- Opção de deletar.


Nota sobre extensibilidade

A tabela users inclui uma coluna face_descriptor (TEXT, aceita NULL)
e existe um endpoint POST /api/auth/descriptor, preparados para uma
eventual evolução do projeto rumo a autenticação por reconhecimento facial.
Não fazem parte do escopo deste desafio e não são usados pelo CRUD — ficam
disponíveis caso o time queira explorar esse caminho depois, sem precisar
alterar o que já existe (Open/Closed Principle).













