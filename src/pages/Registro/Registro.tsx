import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Registro.css';

function Registro() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const { registrarUser, loginUser } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsgs([]);
    setEnviando(true);

    try {
      await registrarUser({ username, email, password, confirmarPassword });
      await loginUser({ email, password });
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errores) {
        setErrorMsgs(err.response.data.errores);
      } else if (err.response?.data?.mensaje) {
        setErrorMsgs([err.response.data.mensaje]);
      } else {
        setErrorMsgs(['Ocurrió un error al registrar la cuenta.']);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-container">
      <section className="login-panel">
        <div className="login-decoracion">
          <div className="audio-barra"></div>
          <div className="audio-barra-secundaria"></div>
        </div>

        <div className="panel-texto">
          <h1>
            Tu música.
            <br />
            Tu historia.
          </h1>
          <p>
            Guardá canciones, organizá colecciones y descubrí cómo escuchás música.
          </p>
        </div>
      </section>

      <section className="login-formulario">
        <div className="login-contenido">
          <div className="login-encabezado">
            <h2>Crear cuenta</h2>
            <p>Completá tus datos para empezar.</p>
          </div>

          {errorMsgs.length > 0 && (
            <div className="error-box" style={{ color: '#ff4d4d', marginBottom: '1rem' }}>
              {errorMsgs.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="campo-login">
              <label htmlFor="username">NOMBRE DE USUARIO (5 A 10 CARACTERES)</label>
              <input
                id="username"
                type="text"
                placeholder="usuario123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="campo-login">
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <input
                id="email"
                type="email"
                placeholder="martina@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="campo-login">
              <label htmlFor="password">CONTRASEÑA (MÍNIMO 8 CARACTERES)</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="campo-login">
              <label htmlFor="confirmarPassword">CONFIRMAR CONTRASEÑA</label>
              <input
                id="confirmarPassword"
                type="password"
                placeholder="••••••••"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-boton" disabled={enviando}>
              {enviando ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="crear-cuenta-wrapper">
            ¿Ya tenés cuenta? <Link to="/login" className="crear-cuenta-link">Iniciá sesión</Link>
          </p>

          <p className="login-privacidad">
            Los datos personales son privados por usuario.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Registro;