import { MouseEventHandler, PropsWithChildren } from 'react';
import { CommonButton } from '../CommonButton';
import './styles.scss';
import { useTranslation } from 'react-i18next';

const CommonModal = ({ 
    name, 
    onConfirm, 
    onConfirmText, 
    onClose,
    onCloseText, 
    children
}: PropsWithChildren<CommonModalProps> ) => {
    const { t } = useTranslation();

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
                        { onCloseText || t("Close") }
                    </CommonButton>
                    {
                        onConfirm &&
                        <CommonButton color='success' onClick={onConfirm}>
                            { onConfirmText || t("Confirm") }
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
    onCloseText?: string
}

export { CommonModal }