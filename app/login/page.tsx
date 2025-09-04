"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica de login aquí
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Iniciar Sesión - ERPExpert</title>
        <meta name="description" content="Inicia sesión en tu cuenta de ERPExpert" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl">EE</div>
              <span className="ml-2 text-xl font-bold text-gray-800">ERPExpert</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-gray-600">
              O{' '}
              <Link href="/demo" className="font-medium text-blue-600 hover:text-blue-500">
                solicita una demo gratuita
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Recordarme
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Descubre el poder de ERPExpert</h2>
            <p className="text-xl mb-8">Gestiona tu empresa de manera eficiente con nuestra plataforma todo-en-uno</p>
            <div className="space-y-4 text-left max-w-md mx-auto">
              {[
                { text: 'Control total de inventarios en tiempo real', icon: '✓' },
                { text: 'Facturación electrónica integrada con el SAT', icon: '✓' },
                { text: 'Reportes avanzados y dashboards personalizables', icon: '✓' },
                { text: 'Soporte técnico 24/7 para todos nuestros clientes', icon: '✓' }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="bg-green-500 rounded-full h-6 w-6 flex items-center justify-center mr-3">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
