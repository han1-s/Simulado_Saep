# SAEPSaúde — Avaliação SAEP

Projeto Full Stack para a Avaliação Prática de Desempenho dos Estudantes.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MySQL
- mysql2
- CORS
- dotenv
- bcryptjs
- JWT
- Nodemon

## Estrutura

- `backend/` API REST
- `frontend/` SPA e interface
- `database/` banco, dados de teste e orientações de importação

## Instalação

1. Abra o MySQL.
2. Execute `database/database.sql`.
3. Abra um terminal na pasta `backend`.
4. Copie `.env.example` para `.env`.
5. Preencha a senha do MySQL no `.env`.
6. Execute:

```bash
npm install
npm start
```

Para desenvolvimento:

```bash
npm run dev
```

7. Acesse `http://localhost:3000`.

## Login de teste

E-mail:

`usuario01@saepsaude.com`

Senha:

`123456`

Também estão disponíveis:

`usuario02@saepsaude.com`

`usuario03@saepsaude.com`

## Requisitos implementados

- Perfil da empresa carregado do banco
- Total de atividades
- Total de calorias
- Login e logout
- Modal de login
- Validações
- SPA após login
- Filtros por corrida, caminhada e trilha
- Paginação
- Primeira, Anterior, Próxima e Última
- Quantidade configurável por página
- Curtida única por usuário/atividade
- Remoção da própria curtida
- Persistência de likes
- Comentários persistentes
- Validação de comentários
- Cadastro de atividade
- Persistência de atividades
- Nova atividade no início da lista
- Conversão de metros para quilômetros
- Conversão de minutos para horas
- Atualização dinâmica com Fetch API
- Queries parametrizadas
- Chaves estrangeiras
- Restrição UNIQUE para likes
- Fonte Inter
- Cores exigidas pela prova

## Observação sobre os CSVs

A prova menciona `usuarios.csv` e `atividades.csv`, mas esses arquivos reais não foram anexados ao projeto. Por isso, foram fornecidos dados de teste e um guia em `database/README_IMPORTACAO.md`, sem afirmar que os dados de exemplo são os dados reais da prova.
