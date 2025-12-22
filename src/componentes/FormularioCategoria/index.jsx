import React from 'react';
import './formularioCategoria.css';

const FormularioCategoria = ({ valores, handleInputChange, onSubmit, erro, sucesso }) => {
    return (
        <form className="formulario-horizontal" onSubmit={onSubmit}>
            {erro && <div className="error-message">{erro}</div>}
            {sucesso && <div className="success-message">{sucesso}</div>}

            <div className="linha-formulario">
                <div className="campo-formulario">
                    <label htmlFor="name">Nome da Categoria</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={valores.name}
                        onChange={handleInputChange}
                        placeholder="Digite o nome da categoria"
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="type">Tipo</label>
                    <select
                        id="type"
                        name="type"
                        value={valores.type}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="RECEIPT">Recebimentos</option>
                        <option value="PAYMENT">Pagamentos</option>
                    </select>
                </div>
            </div>

            <div className="botoes-formulario">
                <button type="submit" className="botao-salvar">
                    Cadastrar
                </button>
            </div>
        </form>
    );
};

export default FormularioCategoria;