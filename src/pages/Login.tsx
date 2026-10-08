// #region Importações
import { useState } from 'react';
import type { FormEvent } from 'react';

import logoOrbita from '../assets/logo-orbita-sidebside.png';

import { Button } from '../components/common/Button';
import { Input }  from '../components/common/Input';

import './Login.css';
// #endregion

// #region Tipos
interface LoginProps {
  onEnterDemo: () => void;
}
// #endregion

// #region Componente
export function Login({ onEnterDemo }: LoginProps) {
  // #region Estado
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  // #endregion

  // #region Eventos
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onEnterDemo();
  }
  // #endregion

  // #region Renderização
  return (
    <main className="login">
      {/* #region Apresentação */}
      <section
        className="login__brand"
        aria-label="Sobre o Órbita"
      >
        <div className="login__brand-content">
          <img
            className="login__logo"
            src={logoOrbita}
            alt="Órbita"
          />

          <p className="login__description">
            Gestão de demandas de inovação. Conectando desafios
            organizacionais a soluções colaborativas com metodologia
            e rastreabilidade.
          </p>
        </div>
      </section>
      {/* #endregion */}

      {/* #region Formulário */}
      <section
        className="login__panel"
        aria-labelledby="login-form-title"
      >
        <div className="login__form-container">
          <header className="login__header">
            <h1 id="login-form-title">Entrar</h1>

            <p>Acesse sua conta para continuar</p>
          </header>

          <form className="login__form" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.gov.br"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Button type="submit" className="login__submit">
              Entrar
            </Button>

            <p className="login__demo-notice">
              Demonstração: utilize dados fictícios. Nenhuma
              credencial será enviada ou armazenada.
            </p>
          </form>

          <p className="login__help">
            Problema de acesso? Contate o administrador do sistema.
          </p>
        </div>
      </section>
      {/* #endregion */}
    </main>
  );
  // #endregion
}
// #endregion