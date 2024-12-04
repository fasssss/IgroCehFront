import { ChangeEvent } from 'react';
import './styles.scss';

const CommonField = ({placeholder, value, onChange, className}: CommonFieldProps) => {

    return(
        <div className={`common-field ${className || ""}`}>
            <div className="common-field__field">
                <input list='guilds' value={value} placeholder={placeholder} onChange={onChange} className='common-field__input' type="text" />
            </div>
        </div>
    );
}

export type CommonFieldProps = {
    placeholder?: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => any,
    value: string,
    className?: string
}

export { CommonField }