import { useState } from 'react';
import './Auth.css';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      onLogin(data.token, data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Logga in' : 'Skapa konto'}</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Användarnamn</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Laddar...' : (isLogin ? 'Logga in' : 'Skapa konto')}
        </button>
      </form>

      <div className="auth-toggle">
        {isLogin ? 'Har du inget konto?' : 'Har du redan ett konto?'}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Skapa konto' : 'Logga in'}
        </button>
      </div>
    </div>
  );
}

export default Auth;
