
import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';

import { auth } from './firebase';
import App from './App';
import './Login.css';

export default function AuthGate() {
  const [usuario, setUsuario] = useState(null);
  const [inicializando, setInicializando] = useState(true);
  const [modo, setModo] = useState('login');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUsuario(user);
      setInicializando(false);
    });

    return unsubscribe;
  }, []);

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setMensaje('');
    setPassword('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setCargando(true);

    try {
      const email = correo.trim();

      if (modo === 'recuperar') {
        await sendPasswordResetEmail(auth, email);

        setMensaje(
          'Si existe una cuenta asociada, recibirás un correo de recuperación.'
        );

      } else if (modo === 'registro') {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

    } catch (error) {
      const errores = {
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/email-already-in-use': 'Este correo ya está registrado.',
        'auth/weak-password': 'Utiliza mínimo 6 caracteres.',
        'auth/invalid-email': 'Ingresa un correo válido.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
        'auth/network-request-failed': 'Comprueba tu conexión a Internet.',
        'auth/operation-not-allowed': 'El acceso por correo no está habilitado.'
      };

      setMensaje(
        errores[error.code] ||
        'No se pudo completar la operación.'
      );

      console.error(error.code);

    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    if (!window.confirm('¿Deseas cerrar sesión en PC Lab?')) {
      return;
    }

    try {
      await signOut(auth);
      setPassword('');
      setMensaje('');
      setModo('login');
    } catch {
      window.alert('No se pudo cerrar la sesión.');
    }
  };

  if (inicializando) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <p>Inicializando PC LAB...</p>
      </div>
    );
  }

  if (usuario) {
    return (
      <>
        <div className="auth-userbar">
          <span>
            Sesión activa · {usuario.email}
          </span>

          <button onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>

        <App key={usuario.uid} userId={usuario.uid} />
      </>
    );
  }

  return (
    <main className="auth-page">

      <section className="auth-presentation">
        <div className="auth-logo">
          PC<span>LAB</span>
        </div>

        <div className="auth-tag">
          NEON FORGE / ACCESS SYSTEM
        </div>

        <h1>
          Construye<br />
          <span>sin límites.</span>
        </h1>

        <p>
          Explora componentes reales, comprueba su
          compatibilidad y diseña tu próxima PC.
        </p>

        <div className="auth-features">
          <span>01 / Hardware real</span>
          <span>02 / Visualización 3D</span>
          <span>03 / Compatibilidad</span>
        </div>
      </section>

      <section className="auth-card">

        <div className="auth-status">
          <span />
          SISTEMA EN LÍNEA
        </div>

        <h2>
          {modo === 'registro'
            ? 'Crear cuenta'
            : modo === 'recuperar'
              ? 'Recuperar acceso'
              : 'Bienvenido a PC Lab'}
        </h2>

        <p className="auth-description">
          {modo === 'recuperar'
            ? 'Ingresa el correo asociado a tu cuenta.'
            : 'Ingresa tus credenciales para continuar.'}
        </p>

        <form onSubmit={enviar}>

          <label>Correo electrónico</label>

          <input
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            placeholder="usuario@email.com"
            autoComplete="email"
            required
          />

          {modo !== 'recuperar' && (
            <>
              <label>Contraseña</label>

              <div className="auth-password">
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete={
                    modo === 'registro'
                      ? 'new-password'
                      : 'current-password'
                  }
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() => setVerPassword(v => !v)}
                >
                  {verPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </>
          )}

          {mensaje && (
            <p className="auth-message" role="status">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={cargando}
          >
            {cargando
              ? 'Procesando...'
              : modo === 'registro'
                ? 'Crear cuenta'
                : modo === 'recuperar'
                  ? 'Enviar correo'
                  : 'Iniciar sesión'}
          </button>

        </form>

        <div className="auth-links">

          {modo === 'login' && (
            <>
              <button onClick={() => cambiarModo('recuperar')}>
                ¿Olvidaste tu contraseña?
              </button>

              <button onClick={() => cambiarModo('registro')}>
                Crear una cuenta
              </button>
            </>
          )}

          {modo !== 'login' && (
            <button onClick={() => cambiarModo('login')}>
              Volver a iniciar sesión
            </button>
          )}

        </div>

        <footer className="auth-footer">
          PC LAB · NEON FORGE
        </footer>

      </section>

    </main>
  );
}
