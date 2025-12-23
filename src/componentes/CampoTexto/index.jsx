import './campoTexto.css';

const CampoTexto = ({ texto, label, name, type, valor, placeholder, onChange, autoComplete, className }) => {
    return (
        <div className={`campo-texto ${className || ''}`}>
            {texto && <h1>{texto}</h1>}
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type || "text"}
                value={valor || ''}
                placeholder={placeholder}
                onChange={onChange}
                name={name}
                autoComplete={autoComplete || "off"}
            />
        </div>
    );
};

export default CampoTexto;