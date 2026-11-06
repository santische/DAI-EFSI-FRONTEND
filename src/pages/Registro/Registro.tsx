import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext/UserContext';

// Importación de componentes comunes
import MensajeError from '../../componentes/comunes/MensajeError/MensajeError';
import Loading from '../../componentes/comunes/Loading/Loading';

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
    <main className="registro-container">
      <section className="registro-panel">
        <div className="registro-decoracion">
          <div className="registro-barra"></div>
          <div className="registro-barra-secundaria"></div>
        </div>

        <div className="registro-panel-texto">
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

      <section className="registro-formulario">
        <div className="registro-contenido">
          <div className="registro-encabezado">
            <h2>Crear cuenta</h2>
            <p>Completá tus datos para empezar.</p>
          </div>

          {/* 1. Mensaje de error reutilizable */}
          {errorMsgs.length > 0 && (
            <MensajeError mensaje={errorMsgs.join('. ')} />
          )}

          <form onSubmit={handleSubmit}>
            <div className="campo-registro">
              <label htmlFor="username">NOMBRE DE USUARIO (5 A 10 CARACTERES)</label>
              <input
                id="username"
                type="text"
                placeholder="usuario123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={enviando}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <input
                id="email"
                type="email"
                placeholder="martina@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={enviando}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="password">CONTRASEÑA (MÍNIMO 8 CARACTERES)</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={enviando}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="confirmarPassword">CONFIRMAR CONTRASEÑA</label>
              <input
                id="confirmarPassword"
                type="password"
                placeholder="••••••••"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                disabled={enviando}
                required
              />
            </div>

            {/* 2. Indicador de carga en el botón */}
            <button type="submit" className="registro-boton" disabled={enviando}>
              {enviando ? <Loading /> : 'Crear cuenta'}
            </button>
          </form>

          <p className="registro-volver">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>

          <p className="registro-privacidad">
            Los datos personales son privados por usuario.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Registro;