import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';

const TYPE_OPTIONS = [
    { value: 'RECEIPT', label: 'Recebimentos' },
    { value: 'PAYMENT', label: 'Pagamentos' },
];

const FormularioCategoria = ({ valores, handleInputChange, onSubmit, erro, sucesso, editando = false, onCancel }) => {
    return (
        <Card>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {erro && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>}
                {sucesso && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Nome da Categoria"
                        id="name"
                        name="name"
                        type="text"
                        value={valores.name}
                        onChange={handleInputChange}
                        placeholder="Digite o nome da categoria"
                        required
                    />

                    <Select
                        label="Tipo"
                        id="type"
                        name="type"
                        value={valores.type}
                        onChange={handleInputChange}
                        options={TYPE_OPTIONS}
                        required
                    />
                </div>

                <div className="flex gap-3">
                    <Button type="submit">
                        {editando ? 'Salvar Alterações' : 'Cadastrar'}
                    </Button>
                    {editando && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
};

export default FormularioCategoria;
