import React from 'react';
import Botao from '../Botao';
import './card.css';
import imagemPadrao from '../../assets/imagens/conta-padrao.png';

const Card = ({ conta, onEntrar, onEditar, onExcluir }) => {
    
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
        <div className='card'>
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
                <button className="botao-entrar" onClick={() => onEntrar(conta.id)}>Entrar</button>
                <button className="botao-editar" onClick={() => onEditar(conta.id)}>Editar</button>
                <button className="botao-excluir" onClick={() => onExcluir(conta.id)}>Excluir</button>
            </div>
        </div>
    );
};

export default Card;