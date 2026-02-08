import { useEffect, useMemo, useState } from 'react';
import './App.css';

type GlobalData = {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
  };
};

type Coin = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
};

type Trending = {
  coins: { item: { id: string; name: string; symbol: string; small: string; score: number } }[];
};

type ApiState = {
  global: GlobalData | null;
  coins: Coin[];
  trending: Trending | null;
};

const CACHE_KEY = 'dashboard_cache_v1';
const CACHE_TTL = 10 * 60 * 1000; // 10 min

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value);
}

export default function App() {
  const [data, setData] = useState<ApiState>({ global: null, coins: [], trending: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalCap = useMemo(() => data.global?.data.total_market_cap?.eur ?? 0, [data.global]);
  const totalVol = useMemo(() => data.global?.data.total_volume?.eur ?? 0, [data.global]);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          setData(parsed.payload);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    async function fetchAll() {
      try {
        setLoading(true);
        const [globalRes, coinsRes, trendRes] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/global'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=10&page=1&sparkline=false'),
          fetch('https://api.coingecko.com/api/v3/search/trending')
        ]);

        if (!globalRes.ok || !coinsRes.ok || !trendRes.ok) {
          throw new Error('Falha ao carregar dados');
        }

        const payload = {
          global: await globalRes.json(),
          coins: await coinsRes.json(),
          trending: await trendRes.json(),
        } as ApiState;

        setData(payload);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), payload }));
        setError('');
      } catch (err: any) {
        setError('N?o foi poss?vel carregar os dados. Tenta novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">DX</div>
          <div>
            <p className="eyebrow">Dashboard de Dados Reais</p>
            <h1>Mercado Cripto ? vis?o r?pida</h1>
          </div>
        </div>
        <div className="actions">
          <span className="pill">API: CoinGecko</span>
          <a className="btn" href="http://localhost:8080/">Voltar ao Portf?lio</a>
        </div>
      </header>

      <section className="summary">
        <div className="card">
          <h3>Capitaliza??o total</h3>
          <p className="big">{formatCurrency(totalCap)}</p>
          <span className={`tag ${data.global?.data.market_cap_change_percentage_24h_usd && data.global.data.market_cap_change_percentage_24h_usd >= 0 ? 'up' : 'down'}`}>
            {data.global?.data.market_cap_change_percentage_24h_usd?.toFixed(2) ?? '0.00'}% 24h
          </span>
        </div>
        <div className="card">
          <h3>Volume (24h)</h3>
          <p className="big">{formatCurrency(totalVol)}</p>
          <span className="muted">Mercados: {formatNumber(data.global?.data.markets ?? 0)}</span>
        </div>
        <div className="card">
          <h3>Criptos ativas</h3>
          <p className="big">{formatNumber(data.global?.data.active_cryptocurrencies ?? 0)}</p>
          <span className="muted">Top 10 por market cap</span>
        </div>
      </section>

      <main className="grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Top moedas</h2>
            <p>Pre?os em EUR, atualiza??o autom?tica.</p>
          </div>
          {loading ? (
            <div className="loading">A carregar...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Moeda</th>
                  <th>Pre?o</th>
                  <th>24h</th>
                  <th>Market Cap</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {data.coins.map((coin) => (
                  <tr key={coin.id}>
                    <td className="coin">
                      <img src={coin.image} alt={coin.name} />
                      <div>
                        <strong>{coin.name}</strong>
                        <span>{coin.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(coin.current_price)}</td>
                    <td className={coin.price_change_percentage_24h >= 0 ? 'up' : 'down'}>
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td>{formatCurrency(coin.market_cap)}</td>
                    <td>{formatCurrency(coin.total_volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <aside className="panel">
          <div className="panel-head">
            <h2>Tend?ncias</h2>
            <p>Moedas com maior procura nas ?ltimas horas.</p>
          </div>
          <div className="trend-list">
            {data.trending?.coins.map(({ item }) => (
              <div className="trend-item" key={item.id}>
                <img src={item.small} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.symbol}</span>
                </div>
                <span className="score">#{item.score + 1}</span>
              </div>
            ))}
          </div>
          <div className="note">
            <h4>Porque isto ? valioso?</h4>
            <p>
              Este dashboard mostra integra??o real com API p?blica, cache local, tratamento de erros e UI responsiva.
              ? um bom exemplo de produto orientado a dados.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
