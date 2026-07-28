import { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function Stats() {
  const [codigo, setCodigo] = useState('');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  const buscarStats = async (e) => {
    e.preventDefault();
    setErro('');
    setDados(null);

    try {
      const resposta = await axios.get(`http://localhost:3001/api/links/${codigo}/stats`);
      setDados(resposta.data);
    } catch (err) {
      setErro('Link não encontrado.');
    }
  };

  // Agrupar cliques por dia, pra montar o gráfico
  const cliquesPorDia = dados
    ? Object.entries(
        dados.cliques.reduce((acc, clique) => {
          const dia = new Date(clique.clicado_em).toLocaleDateString('pt-BR');
          acc[dia] = (acc[dia] || 0) + 1;
          return acc;
        }, {})
      ).map(([dia, total]) => ({ dia, total }))
    : [];

  return (
    <div className="container">
        <div className="card">
            <div className="card">
                <h1>Estatísticas do Link</h1>

                <form onSubmit={buscarStats}>
                    <input
                    type="text"
                    placeholder="Cole o código do link (ex: 7i-yOx)"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    />
                    <button type="submit">Buscar</button>
                </form>

                {erro && <p className="erro">{erro}</p>}

                {dados && (
                    <div className="resultado">
                    <p><strong>URL original:</strong> {dados.url_original}</p>
                    <p><strong>Total de cliques:</strong> {dados.total_cliques}</p>

                    {cliquesPorDia.length > 0 && (
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={cliquesPorDia}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

export default Stats;