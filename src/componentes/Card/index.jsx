import React from 'react';
import imagemPadrao from '../../assets/imagens/conta-padrao.png';

const Card = ({ conta, onEntrar, onEditar, onExcluir, className }) => {

    const handleImageError = (e) => {
        e.target.src = imagemPadrao;
    };

    const getOwnerName = () => {
        if (conta.userAccount) {
            return conta.userAccount.name || conta.userAccount.email;
        }
        return "Proprietário não informado";
    };

    return (
        <div className={`card ${className || ''}`}>
            <div className="card-header">
                <img
                    className='imagem-card'
                    src={conta.photoUrl || imagemPadrao}
                    alt='Imagem da conta'
                    onError={handleImageError}
                />
                <h1>{conta.name}</h1>
            </div>

            <div className="card-content">

                <div className="info-proprietario">
                    <strong>Proprietário:</strong>
                    <p>{getOwnerName()}</p>
                </div>
            </div>

            <div className="card-botoes">
                <button className="fh-btn fh-btn-primary" onClick={() => onEntrar(conta.id)}>Entrar</button>
                <button className="fh-btn fh-btn-secondary" onClick={() => onEditar(conta.id)}>Editar</button>
                <button className="fh-btn fh-btn-danger" onClick={() => onExcluir(conta.id)}>Excluir</button>
            </div>
        </div>
    );
};

export default Card;
