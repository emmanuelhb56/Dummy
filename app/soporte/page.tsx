"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink, HelpCircle, LifeBuoy, Mail } from 'lucide-react';

const Soporte = () => {
  const [activeTab, setActiveTab] = useState('faq');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Centro de Ayuda</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Header */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl flex items-center justify-center">
              <LifeBuoy className="w-10 h-10 mr-2" />
              Centro de Soporte
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte con cualquier pregunta o problema. Nuestro equipo de soporte está listo para ayudarte a resolver cualquier duda o inquietud que tengas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['faq', 'contacto', 'documentacion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'faq' && (
                  <span className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Preguntas Frecuentes
                  </span>
                )}
                {tab === 'contacto' && (
                  <span className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Contacto
                  </span>
                )}
                {tab === 'documentacion' && (
                  <span className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Documentación
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'faq' && (
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                question: "¿Cómo puedo iniciar mi prueba gratuita?",
                answer: "Puedes iniciar tu prueba gratuita de 14 días haciendo clic en el botón 'Demo Gratuita' en cualquier parte de nuestro sitio web. No se requiere tarjeta de crédito."
              },
              {
                question: "¿ERPExpert funciona en mi industria?",
                answer: "Sí, ERPExpert está diseñado para adaptarse a múltiples industrias incluy retail, manufactura, servicios y más. Contamos con módulos especializados para diferentes necesidades."
              },
              {
                question: "¿Qué métodos de pago aceptan?",
                answer: "Aceptamos tarjetas de crédito/débito, transferencias bancarias y PayPal. También ofrecemos facturación para empresas."
              },
              {
                question: "¿Ofrecen capacitación para nuevos usuarios?",
                answer: "Sí, ofrecemos sesiones de capacitación gratuitas para todos nuestros clientes. Además, contamos con videotutoriales y documentación extensa."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  {faq.question}
                </h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contacto' && (
          <div className="max-w-2xl mx-auto">
            <form className="space-y-6" action="#" method="POST">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="block w-full px-5 py-3 text-base text-gray-700 transition duration-150 ease-in-out bg-gray-100 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="block w-full px-5 py-3 text-base text-gray-700 transition duration-150 ease-in-out bg-gray-100 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tuemail@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Mensaje
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="block w-full px-5 py-3 text-base text-gray-700 transition duration-150 ease-in-out bg-gray-100 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escribe tu mensaje aquí"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'documentacion' && (
          <div className="max-w-2xl mx-auto transition duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 tracking-wide mb-2">
              Documentación
            </h3>
            <p className="text-gray-600 mb-4">
              Puedes encontrar nuestra documentación en nuestro sitio web. Allí podrás encontrar tutoriales, guías y mucho más.
            </p>
            <a
              href="#"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ir a la documentación
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">ERPExpert</h3>
              <p className="mt-4 text-base text-gray-400">
                La solución integral de gestión empresarial para PyMEs y grandes empresas.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Soluciones</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Para Retail</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Para Manufactura</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Para Servicios</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Soporte</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="/soporte" className="text-base text-gray-400 hover:text-white">Centro de Soporte</Link></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Documentación</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacidad</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 ERPExpert. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Soporte;
