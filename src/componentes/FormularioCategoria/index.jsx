import React from 'react';
import SprayUnderline from '../SprayUnderline';

const FormularioCategoria = ({ valores, handleInputChange, onSubmit, erro, sucesso, editando = false, onCancel }) => {
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
                <div className="fh-btn-primary-wrap">
                    <button type="submit" className="botao-salvar">
                        {editando ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                    <SprayUnderline width={100} color="var(--accent)" className="btn-spray" />
                </div>
                {editando && (
                    <button type="button" className="btn-secundario" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

export default FormularioCategoria;
