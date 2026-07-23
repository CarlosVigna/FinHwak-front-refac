import React from 'react';
import imagemPadrao from '../../assets/imagens/conta-padrao.png';
import UiCard from '../ui/Card';
import Button from '../ui/Button';

const Card = ({ conta, onEntrar, onEditar, onExcluir, className = '' }) => {

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
        <UiCard className={`flex flex-col gap-4 ${className}`}>
            <div className="flex items-center gap-3">
                <img
                    className="h-12 w-12 rounded-md object-cover"
                    src={conta.photoUrl || imagemPadrao}
                    alt="Imagem da conta"
                    onError={handleImageError}
                />
                <h1 className="text-lg font-semibold text-text">{conta.name}</h1>
            </div>

            <div className="text-sm">
                <strong className="text-text">Proprietário:</strong>
                <p className="text-muted2">{getOwnerName()}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onEntrar(conta.id)}>Entrar</Button>
                <Button size="sm" variant="outline" onClick={() => onEditar(conta.id)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => onExcluir(conta.id)}>Excluir</Button>
            </div>
        </UiCard>
    );
};

export default Card;
