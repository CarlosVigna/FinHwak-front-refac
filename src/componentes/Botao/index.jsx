
const Botao = ({ texto, onClick, className, disabled }) => {
    return (
        <button
        onClick={onClick}
        className={className}
        disabled={disabled}>
            {texto}
        </button>
    );
}

export default Botao;
