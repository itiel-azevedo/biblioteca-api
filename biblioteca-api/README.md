# API Biblioteca Comunitária

API REST (Node.js + Express) para cadastro de livros e controle de empréstimos.

## Como executar
```
npm install
npm start
```
A API ficará em http://localhost:3000

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| GET | /livros | Lista livros (?autor= / ?disponivel=true\|false) |
| GET | /livros/:id | Busca livro |
| POST | /livros | Cadastra livro |
| PUT | /livros/:id | Atualiza livro |
| DELETE | /livros/:id | Remove livro |
| GET | /emprestimos | Lista empréstimos |
| POST | /emprestimos | Registra empréstimo |
| PATCH | /emprestimos/:id/devolucao | Registra devolução |
