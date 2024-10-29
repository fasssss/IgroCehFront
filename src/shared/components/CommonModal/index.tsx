import { MouseEventHandler, PropsWithChildren } from 'react';
import { CommonButton } from '../CommonButton';
import './styles.scss';

const CommonModal = ({ 
    name, 
    onConfirm, 
    onConfirmText, 
    onClose, 
    children
}: PropsWithChildren<CommonModalProps> ) => {

    return(
        <div className="common-modal">
            <div className="common-modal__container">
                <div className="common-modal__header">
                    { name }
                </div>
                <div className="common-modal__body">
                    { children }
                </div>
                <div className="common-modal__actions">
                    <CommonButton color='error' onClick={onClose}>
                        Close
                    </CommonButton>
                    {
                        onConfirm &&
                        <CommonButton color='success' onClick={onConfirm}>
                            { onConfirmText || "Confirm" }
                        </CommonButton>
                    }
                </div>
            </div>
        </div>
    );
};

type CommonModalProps = {
    name: string,
    onConfirm?: MouseEventHandler<HTMLButtonElement>,
    onConfirmText?: string,
    onClose: MouseEventHandler<HTMLButtonElement>
}

export { CommonModal }