import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log('Correo:', correo);
    console.log('Contraseña ingresada');
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
            Guardá canciones, organizá colecciones
            y descubrí cómo escuchás música.
          </p>
        </div>
      </section>

      <section className="login-formulario">
        <div className="login-contenido">

          <div className="login-encabezado">
            <h2>Qué bueno verte.</h2>
            <p>Iniciá sesión para entrar a tu colección.</p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="campo-login">
              <label htmlFor="correo">
                CORREO ELECTRÓNICO
              </label>

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
              <label htmlFor="contrasena">
                CONTRASEÑA
              </label>

              <input
                id="contrasena"
                type="password"
                placeholder="Ingresá tu contraseña"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-boton">
              Iniciar sesión
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