import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Login.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const { loginUser } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsgs([]);
    setEnviando(true);

    try {
      await loginUser({ email: correo, password: contrasena });
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errores) {
        setErrorMsgs(err.response.data.errores);
      } else if (err.response?.data?.mensaje) {
        setErrorMsgs([err.response.data.mensaje]);
      } else {
        setErrorMsgs(['Ocurrió un error al iniciar sesión. Intentá nuevamente.']);
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
            <h2>Qué bueno verte.</h2>
            <p>Iniciá sesión para entrar a tu colección.</p>
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
              <label htmlFor="correo">CORREO ELECTRÓNICO</label>
              <input
                id="correo"
                type="email"
                placeholder="martina@mail.com"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                required
              />
            </div>

            <div className="campo-login">
              <label htmlFor="contrasena">CONTRASEÑA</label>
              <input
                id="contrasena"
                type="password"
                placeholder="Ingresá tu contraseña"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-boton" disabled={enviando}>
              {enviando ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="crear-cuenta-wrapper">
            ¿Todavía no tenés cuenta? <Link to="/registro" className="crear-cuenta-link">Crear una</Link>
          </p>

          <p className="login-privacidad">
            Los datos personales son privados por usuario.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;