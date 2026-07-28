import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Stats from './Stats';
import './App.css';

function Home() {
  const [urlOriginal, setUrlOriginal] = useState('');
  const [urlCurta, setUrlCurta] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setUrlCurta('');

    try {
      const resposta = await axios.post('https://encurtador-url-production-ef09.up.railway.app/api/links', {
        url_original: urlOriginal
      });
      setUrlCurta(resposta.data.url_curta);
    } catch (err) {
      setErro('Erro ao encurtar o link. Verifique a URL e tente novamente.');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Encurtador de URL</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="Cole sua URL aqui..."
            value={urlOriginal}
            onChange={(e) => setUrlOriginal(e.target.value)}
            required
          />
          <button type="submit">Encurtar</button>
        </form>

        {urlCurta && (
          <div className="resultado">
            <p>Link encurtado:</p>
            <a href={urlCurta} target="_blank" rel="noopener noreferrer">
              {urlCurta}
            </a>
          </div>
        )}

        {erro && <p className="erro">{erro}</p>}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="page-wrapper">
      <div className="content-block">
        <nav className="top-nav">
          <Link to="/">Encurtar</Link>
          <Link to="/stats">Estatísticas</Link>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;