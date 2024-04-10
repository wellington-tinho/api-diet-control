# API Diet Control

API com fastify para gerenciar dietas.

---



### RFs - Requisitos Funcionais - (Regras da aplicação)
- Deve ser possível criar um usuário 
- Deve ser possível identificar o usuário entre as requisições 
- Deve ser possível registrar uma refeição feita, com as seguintes informações: 

  *As refeições devem ser relacionadas a um usuário.*
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta
- Deve ser possível editar uma refeição, podendo alterar todos os dados acima 
- Deve ser possível apagar uma refeição 
- Deve ser possível listar todas as refeições de um usuário 
- Deve ser possível visualizar uma única refeição 
- Deve ser possível recuperar as métricas de um usuário 
    - Quantidade total de refeições registradas
    - Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência de refeições dentro da dieta
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou 

--- 

### RNFs - Requisitos Não Funcionais
- A API deve ser desenvolvida com Fastify
- Os dados devem ser armazenados em um banco de dados SQL
- Deve ser usado um Query Builder
- A API deve possuir cookies para autenticação do usuário
- Deve ser desenvolvido testes unitários, de integração e e2e

---

## Rotas da aplicação
- [x] GET `/meals` - Retorna todas as refeições do usuário
- [x] POST `/meals` - Cria uma nova refeição para o usuário, (Se o usuário não estiver autenticado, é criado uma nova sessão)
- [x] GET `/meals/:id` - Retorna uma refeição específica do usuário
- [x] PUT `/meals/:id` - Atualiza uma refeição específica do usuário
- [x] DELETE `/meals/:id` - Deleta uma refeição específica do usuário
- [x] GET `meals/metrics` - Retorna as métricas do usuário

---
## Testes automatizados
- [x] test/meals.spec.ts (4) 
  - [x] should be able to create a new meal 
  - [x] should be able to list all meals 
  - [x] should be able to get a specific meal 
  - [x] should be able to get the metrics 
