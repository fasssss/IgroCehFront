import { ChangeEvent } from 'react';
import './styles.scss';

const CommonField = ({placeholder, value, onChange, className, maxLength}: CommonFieldProps) => {

    return(
        <div className={`common-field ${className || ""}`}>
            <div className="common-field__field">
                <input list='guilds' value={value} placeholder={placeholder} onChange={onChange} maxLength={maxLength} className='common-field__input' type="text" />
            </div>
        </div>
    );
}

export type CommonFieldProps = {
    placeholder?: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    value: string,
    className?: string,
    maxLength?: number
}

export { CommonField }