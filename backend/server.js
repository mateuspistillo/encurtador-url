const express = require('express');
const mysql = require('mysql2/promise');
const { nanoid } = require('nanoid');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do encurtador funcionando!' });
});

// Criar link curto
app.post('/api/links', async (req, res) => {
  const { url_original } = req.body;

  if (!url_original) {
    return res.status(400).json({ erro: 'URL é obrigatória' });
  }

  const codigo = nanoid(6); // gera código tipo "aB3xQ2"

  try {
    await pool.query(
      'INSERT INTO links (codigo, url_original) VALUES (?, ?)',
      [codigo, url_original]
    );
    res.json({ codigo, url_curta: `https://encurtador-url-production-ef09.up.railway.app/${codigo}` });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar link' });
  }
});

// Redirecionar link curto para URL original
app.get('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM links WHERE codigo = ?',
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Link não encontrado' });
    }

    const link = rows[0];

    // Registrar o clique
    await pool.query(
      'INSERT INTO cliques (link_id, ip_usuario) VALUES (?, ?)',
      [link.id, req.ip]
    );

    // Redirecionar para a URL original
    res.redirect(link.url_original);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao processar redirecionamento' });
  }
});

// Buscar estatísticas de um link
app.get('/api/links/:codigo/stats', async (req, res) => {
  const { codigo } = req.params;

  try {
    const [links] = await pool.query(
      'SELECT * FROM links WHERE codigo = ?',
      [codigo]
    );

    if (links.length === 0) {
      return res.status(404).json({ erro: 'Link não encontrado' });
    }

    const link = links[0];

    const [cliques] = await pool.query(
      'SELECT * FROM cliques WHERE link_id = ? ORDER BY clicado_em DESC',
      [link.id]
    );

    res.json({
      codigo: link.codigo,
      url_original: link.url_original,
      criado_em: link.criado_em,
      total_cliques: cliques.length,
      cliques: cliques
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});