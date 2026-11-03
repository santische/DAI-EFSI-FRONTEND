import { Play, ArrowRight, Heart, Music2 } from 'lucide-react'

const canciones = [
  {
    titulo: 'Midnight City',
    artista: 'M83',
    color: 'portada-lila',
  },
  {
    titulo: 'Golden',
    artista: 'Harry Styles',
    color: 'portada-amarilla',
  },
  {
    titulo: 'After Hours',
    artista: 'The Weeknd',
    color: 'portada-roja',
  },
  {
    titulo: '505',
    artista: 'Arctic Monkeys',
    color: 'portada-azul',
  },
]

function Home() {
  return (
    <div className="home">
      <section className="bienvenida">
        <div>
          <span className="etiqueta">TU ESPACIO MUSICAL</span>

          <h1>Tu música, <span>tu mundo.</span></h1>

          <p>
            Descubrí nuevos sonidos, guardá tus favoritos
            y armá tu colección a tu manera.
          </p>

          <button className="boton-principal">
            <Play size={18} fill="currentColor" />
            Explorar música
          </button>
        </div>

        <div className="bienvenida-decoracion">
          <div className="disco">
            <div className="disco-centro">
              <Music2 size={34} />
            </div>
          </div>

          <span className="decoracion-nota nota-uno">♫</span>
          <span className="decoracion-nota nota-dos">♪</span>
        </div>
      </section>

      <section className="seccion">
        <div className="seccion-encabezado">
          <div>
            <span className="subtitulo">PARA VOS</span>
            <h2>Escuchá algo nuevo</h2>
          </div>

          <button className="boton-texto">
            Ver todo <ArrowRight size={17} />
          </button>
        </div>

        <div className="canciones-grid">
          {canciones.map((cancion) => (
            <article className="cancion-card" key={cancion.titulo}>
              <div className={`portada ${cancion.color}`}>
                <Music2 size={42} />

                <button
                  className="boton-reproducir"
                  aria-label={`Reproducir ${cancion.titulo}`}
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>

              <div className="cancion-info">
                <div>
                  <h3>{cancion.titulo}</h3>
                  <p>{cancion.artista}</p>
                </div>

                <button
                  className="boton-favorito"
                  aria-label={`Agregar ${cancion.titulo} a favoritos`}
                >
                  <Heart size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mensaje-coleccion">
        <div>
          <span className="subtitulo">A TU MANERA</span>
          <h2>Tu colección empieza acá.</h2>
          <p>
            Guardá la música que te gusta y organizala
            en tus propias playlists.
          </p>
        </div>

        <div className="coleccion-icono">
          <Heart size={34} />
        </div>
      </section>
    </div>
  )
}

export default Home