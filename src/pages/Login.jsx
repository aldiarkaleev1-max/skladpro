import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, Shield, RefreshCw, BarChart2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
      addToast('Вы успешно вошли', 'success');
    } catch (error) {
      console.error(error);
      addToast('Ошибка входа. Проверьте почту или пароль.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
      addToast('Вы успешно вошли через Google!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Ошибка входа через Google.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .auth-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-color);
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          background: url('/login-bg.png') center center / cover no-repeat;
          position: relative;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(11, 15, 25, 0.95) 100%);
          z-index: 1;
        }
        .auth-left-content {
          position: relative;
          z-index: 2;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-top: auto;
          margin-bottom: auto;
        }
        .brand-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 44px;
          height: 44px;
          background: var(--accent-gradient);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }
        .brand-logo-text {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .promo-title {
          font-size: 40px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
          background: linear-gradient(to right, #ffffff, #c7d2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .promo-subtitle {
          font-size: 16px;
          color: #94a3b8;
          margin-top: 12px;
          line-height: 1.6;
        }
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 20px;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .feature-icon-wrapper {
          margin-top: 2px;
          color: #818cf8;
          background: rgba(129, 140, 248, 0.15);
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-text-title {
          font-weight: 600;
          font-size: 16px;
          color: #ffffff;
        }
        .feature-text-desc {
          font-size: 14px;
          color: #94a3b8;
          margin-top: 4px;
        }
        .auth-right {
          width: 100%;
          max-width: 550px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .auth-form-wrapper {
          width: 100%;
          max-width: 400px;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-header {
          margin-bottom: 36px;
        }
        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .form-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .custom-input-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .custom-input-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .custom-input-field {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-size: 15px;
          transition: all 0.2s ease;
        }
        .custom-input-field:focus {
          border-color: var(--accent);
          background: var(--bg-secondary);
          box-shadow: 0 0 0 4px var(--accent-light);
          outline: none;
        }
        .btn-auth-submit {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          background: var(--accent-gradient);
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
          margin-top: 8px;
        }
        .btn-auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
        }
        .btn-auth-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .divider {
          position: relative;
          margin: 32px 0;
          text-align: center;
        }
        .divider-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-color);
          z-index: 1;
        }
        .divider-text {
          position: relative;
          z-index: 2;
          background: var(--bg-secondary);
          padding: 0 16px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
        }
        .btn-google {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-google:hover:not(:disabled) {
          background: var(--bg-tertiary);
          border-color: var(--text-muted);
        }
        .btn-google:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .footer-link-text {
          text-align: center;
          margin-top: 32px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .footer-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--accent-hover);
        }
        .auth-footer {
          position: relative;
          z-index: 2;
          color: #64748b;
          font-size: 13px;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 1024px) {
          .auth-left {
            display: none;
          }
          .auth-right {
            max-width: 100%;
            padding: 40px 24px;
          }
        }
      `}</style>
      
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="brand-header">
            <div className="brand-logo">
              <Package size={24} color="#fff" />
            </div>
            <span className="brand-logo-text">СкладПро</span>
          </div>

          <div className="auth-left-content">
            <div>
              <h1 className="promo-title">Современный учет запасов</h1>
              <p className="promo-subtitle">
                Полноценная облачная платформа для контроля движения товаров, аналитики, управления складами и поставщиками.
              </p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="feature-text-title">Облачная безопасность</div>
                  <div className="feature-text-desc">Надежная защита данных на серверах Firebase от Google.</div>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <div className="feature-text-title">Мгновенная синхронизация</div>
                  <div className="feature-text-desc">Добавляйте товары с телефона или ПК — данные обновятся везде в реальном времени.</div>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <div className="feature-text-title">Интерактивная отчетность</div>
                  <div className="feature-text-desc">Анализируйте доходы, расходы и следите за статусами запасов в один клик.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            © {new Date().getFullYear()} СкладПро. Все права защищены.
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="form-header">
              <h2 className="form-title">Добро пожаловать!</h2>
              <p className="form-subtitle">Войдите в свой аккаунт для начала работы</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="custom-input-group">
                <label className="custom-input-label">Email</label>
                <input 
                  type="email" 
                  className="custom-input-field" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={loading}
                />
              </div>

              <div className="custom-input-group">
                <label className="custom-input-label">Пароль</label>
                <input 
                  type="password" 
                  className="custom-input-field" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-auth-submit"
                disabled={loading}
              >
                {loading ? 'Выполняется вход...' : 'Войти'}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Или войти через</span>
            </div>

            <button 
              type="button" 
              className="btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <div className="footer-link-text">
              Ещё нет аккаунта? <Link to="/register" className="footer-link">Регистрация</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
