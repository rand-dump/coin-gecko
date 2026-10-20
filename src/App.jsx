import { useEffect, useState } from 'react';

const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

function formatCurrency(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value);
}

function formatCompactCurrency(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function TableRow({ coin, rank }) {
  const change = coin.price_change_percentage_24h;
  const hasChange = typeof change === 'number' && Number.isFinite(change);
  const changeIsPositive = hasChange && change >= 0;

  return (
    <tr>
      <td className="rank">{rank}</td>
      <td>
        <div className="coin-name">
          <img src={coin.image} alt="" />
          <div>
            <strong>{coin.name}</strong>
            <span>{coin.symbol.toUpperCase()}</span>
          </div>
        </div>
      </td>
      <td className="price">{formatCurrency(coin.current_price)}</td>
      <td>
        <span className={`change ${!hasChange ? 'unknown' : changeIsPositive ? 'positive' : 'negative'}`}>
          {formatPercentage(change)}
        </span>
      </td>
      <td className="market-cap">{formatCompactCurrency(coin.market_cap)}</td>
      <td className="volume">{formatCompactCurrency(coin.total_volume)}</td>
    </tr>
  );
}

function App() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function fetchCoins() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (isCurrent) {
          setCoins(data);
          setError('');
        }
      } catch {
        if (isCurrent) {
          setError('Unable to load market data. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    fetchCoins();
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="brand">
          <div className="brand-mark">₿</div>
          <span>CoinWatch</span>
        </div>
        <div className="live-status">
          <span className="status-dot" />
          Live market data
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Market overview</p>
          <h1>Track the market <em>in real time.</em></h1>
          <p className="subtitle">
            Explore the top cryptocurrencies by market capitalization and keep an eye on
            today&apos;s market movement.
          </p>
        </div>
      </header>

      <section className="market-card" aria-labelledby="market-heading">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Top assets</p>
            <h2 id="market-heading">Cryptocurrency markets</h2>
          </div>
          <span className="updated-label">USD · Top 10</span>
        </div>

        {isLoading && (
          <div className="message" role="status">
            <span className="spinner" />
            Loading market data...
          </div>
        )}

        {!isLoading && error && (
          <div className="message error-message" role="alert">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>24h change</th>
                  <th>Market cap</th>
                  <th>Volume (24h)</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, index) => (
                  <TableRow key={coin.id} coin={coin} rank={index + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>
        <span>Data provided by CoinGecko</span>
        <span>Updates on page load</span>
      </footer>
    </main>
  );
}

export default App;
