const express = require('express');
const app = express();
app.use(express.json());

// "Banco de dados" em memória (suficiente para a atividade)
let livros = [
  { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: 1899, disponivel: true },
  { id: 2, titulo: 'O Cortiço', autor: 'Aluísio Azevedo', ano: 1890, disponivel: true },
  { id: 3, titulo: 'Capitães da Areia', autor: 'Jorge Amado', ano: 1937, disponivel: true }
];
let emprestimos = [];
let proxLivro = 4;
let proxEmprestimo = 1;

const erro = (res, status, mensagem) => res.status(status).json({ erro: mensagem });

function validarLivro(b, parcial = false) {
  if (!parcial || b.titulo !== undefined)
    if (typeof b.titulo !== 'string' || !b.titulo.trim()) return 'O campo "titulo" é obrigatório.';
  if (!parcial || b.autor !== undefined)
    if (typeof b.autor !== 'string' || !b.autor.trim()) return 'O campo "autor" é obrigatório.';
  if (b.ano !== undefined && (!Number.isInteger(b.ano) || b.ano < 0 || b.ano > new Date().getFullYear()))
    return 'O campo "ano" deve ser um inteiro válido.';
  return null;
}

// ---------- LIVROS ----------
app.get('/livros', (req, res) => {
  const { autor, disponivel } = req.query;
  let r = livros;
  if (autor) r = r.filter(l => l.autor.toLowerCase().includes(autor.toLowerCase()));
  if (disponivel !== undefined) r = r.filter(l => String(l.disponivel) === disponivel);
  res.status(200).json(r);
});

app.get('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === Number(req.params.id));
  if (!livro) return erro(res, 404, 'Livro não encontrado.');
  res.status(200).json(livro);
});

app.post('/livros', (req, res) => {
  const msg = validarLivro(req.body);
  if (msg) return erro(res, 400, msg);
  const { titulo, autor, ano } = req.body;
  const novo = { id: proxLivro++, titulo: titulo.trim(), autor: autor.trim(), ano: ano ?? null, disponivel: true };
  livros.push(novo);
  res.status(201).json(novo);
});

app.put('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === Number(req.params.id));
  if (!livro) return erro(res, 404, 'Livro não encontrado.');
  const msg = validarLivro(req.body, true);
  if (msg) return erro(res, 400, msg);
  const { titulo, autor, ano } = req.body;
  if (titulo !== undefined) livro.titulo = titulo.trim();
  if (autor !== undefined) livro.autor = autor.trim();
  if (ano !== undefined) livro.ano = ano;
  res.status(200).json(livro);
});

app.delete('/livros/:id', (req, res) => {
  const i = livros.findIndex(l => l.id === Number(req.params.id));
  if (i === -1) return erro(res, 404, 'Livro não encontrado.');
  if (!livros[i].disponivel) return erro(res, 409, 'Livro emprestado não pode ser removido.');
  livros.splice(i, 1);
  res.status(204).send();
});

// ---------- EMPRÉSTIMOS ----------
app.get('/emprestimos', (req, res) => res.status(200).json(emprestimos));

app.post('/emprestimos', (req, res) => {
  const { livroId, leitor } = req.body;
  if (!Number.isInteger(livroId) || typeof leitor !== 'string' || !leitor.trim())
    return erro(res, 400, 'Informe "livroId" (inteiro) e "leitor" (texto).');
  const livro = livros.find(l => l.id === livroId);
  if (!livro) return erro(res, 404, 'Livro não encontrado.');
  if (!livro.disponivel) return erro(res, 409, 'Livro indisponível para empréstimo.');
  const dataEmprestimo = new Date();
  const dataPrevista = new Date(dataEmprestimo.getTime() + 14 * 24 * 3600 * 1000);
  const emp = {
    id: proxEmprestimo++, livroId, leitor: leitor.trim(),
    dataEmprestimo: dataEmprestimo.toISOString().slice(0, 10),
    dataPrevistaDevolucao: dataPrevista.toISOString().slice(0, 10),
    dataDevolucao: null
  };
  livro.disponivel = false;
  emprestimos.push(emp);
  res.status(201).json(emp);
});

app.patch('/emprestimos/:id/devolucao', (req, res) => {
  const emp = emprestimos.find(e => e.id === Number(req.params.id));
  if (!emp) return erro(res, 404, 'Empréstimo não encontrado.');
  if (emp.dataDevolucao) return erro(res, 409, 'Este empréstimo já foi devolvido.');
  emp.dataDevolucao = new Date().toISOString().slice(0, 10);
  livros.find(l => l.id === emp.livroId).disponivel = true;
  res.status(200).json(emp);
});

app.use((req, res) => erro(res, 404, 'Rota não encontrada.'));
app.use((err, req, res, next) => erro(res, 400, 'Requisição inválida (JSON malformado).'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API da Biblioteca rodando em http://localhost:${PORT}`));
