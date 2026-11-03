
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Registro.css';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');

    console.log('Nombre:', nombre);
    console.log('Usuario:', usuario);
    console.log('Correo:', correo);

    // Más adelante conectaremos este formulario con el backend.
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
            Creá tu cuenta y empezá a organizar
            tu propia colección musical.
          </p>
        </div>
      </section>

      <section className="registro-formulario">
        <div className="registro-contenido">

          <div className="registro-encabezado">
            <h2>Creá tu cuenta.</h2>
            <p>Completá tus datos para empezar.</p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="campo-registro">
              <label htmlFor="nombre">NOMBRE Y APELLIDO</label>
              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="usuario">NOMBRE DE USUARIO</label>
              <input
                id="usuario"
                type="text"
                placeholder="Elegí un nombre de usuario"
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="correo">CORREO ELECTRÓNICO</label>
              <input
                id="correo"
                type="email"
                placeholder="usuario@mail.com"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="contrasena">CONTRASEÑA</label>
              <input
                id="contrasena"
                type="password"
                placeholder="Creá una contraseña"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                required
              />
            </div>

            <div className="campo-registro">
              <label htmlFor="confirmarContrasena">
                CONFIRMAR CONTRASEÑA
              </label>
              <input
                id="confirmarContrasena"
                type="password"
                placeholder="Repetí tu contraseña"
                value={confirmarContrasena}
                onChange={(event) => setConfirmarContrasena(event.target.value)}
                required
              />
            </div>

            {error && (
              <p className="registro-error">{error}</p>
            )}

            <button type="submit" className="registro-boton">
              Crear cuenta
            </button>

          </form>

          <p className="registro-volver">
            ¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>

          <p className="registro-privacidad">
            Tus datos personales son privados.
          </p>

        </div>
      </section>

    </main>
  );
}

export default Registro;
