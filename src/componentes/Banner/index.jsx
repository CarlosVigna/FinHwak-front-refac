import React from 'react';
import './banner.css';

const Banner = () => {
    return (
        <section className="banner-dinamico">
            {/* Elementos decorativos de fundo (Blobs animados) */}
            <div className="banner-blob blob-1"></div>
            <div className="banner-blob blob-2"></div>
            <div className="banner-blob blob-3"></div>

            {/* Conteúdo Central */}
            <div className="banner-content">
                <h1 className="banner-title">
                    Fin<span className="highlight">Hwak</span>
                </h1>
                <p className="banner-subtitle">
                    Gerenciamento Financeiro Inteligente
                </p>
                <div className="banner-decoration-line"></div>
            </div>
        </section>
    );
};

export default Banner;
