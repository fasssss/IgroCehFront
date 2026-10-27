import './styles.scss';
import { SvgSelector } from '../SvgSelector';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const DragNDropImage = ({ value, stateMutator, imageUrl, className }: DragNDropProperty) => {
    const { t } = useTranslation();
    const inputFile = useRef<HTMLInputElement | null>(null);
    const dragNDropElement = useRef<HTMLDivElement | null>(null);
    // object url keeps the blob in memory until it is revoked
    const previewUrl = useMemo(() => value && URL.createObjectURL(value), [value]);

    useEffect(() => () => {
        if(previewUrl)
            URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    useEffect(() => {
        const inputFileElement = inputFile.current;
        const dragNDropDivElement = dragNDropElement.current;

        const handlePaste = (e: ClipboardEvent) => {
            const item = Array.from(e.clipboardData?.items || []).find(x => /^image\//.test(x.type));
            const blob = item?.getAsFile();
            if(blob) {
                stateMutator(blob);
            }
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            const blob = Array.from(e.dataTransfer?.files || []).find(x => /^image\//.test(x.type))
            if(blob) {
                stateMutator(blob);
            }
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        }

        const handleDialogOpen = () => {
            inputFileElement?.click();
        }

        const handleDialogSubmit = (e: Event) => {
            const blob = Array.from((e.target as HTMLInputElement).files || []).find(x => /^image\//.test(x.type))
            if(blob) {
                stateMutator(blob);
            }
        }

        document.addEventListener("paste", handlePaste);
        document.addEventListener("drop", handleDrop);
        document.addEventListener("dragover", handleDragOver);
        dragNDropDivElement?.addEventListener("click", handleDialogOpen);
        inputFileElement?.addEventListener("change", handleDialogSubmit);

        return(() => {
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("drop", handleDrop);
            document.removeEventListener("dragover", handleDragOver);
            dragNDropDivElement?.removeEventListener("click", handleDialogOpen);
            inputFileElement?.removeEventListener("change", handleDialogSubmit);
            if(inputFileElement)
                inputFileElement.value = "";
        })
    }, [stateMutator])

    return(
    <div ref={dragNDropElement} className={`drag-n-drop ${className || ""}`}>
        <input type='file' id='file' ref={inputFile} style={{display: 'none'}}/>
        {
            !previewUrl && !imageUrl ?
            <div className="drag-n-drop__placeholder">
                {
                    <SvgSelector iconName="image-icon" />
                }
                {t('Drag or Ctrl-V to paste')}
            </div>
            :
            <img src={previewUrl || imageUrl}/>
        }
    </div>
    );
};

type DragNDropProperty = {
    value: Blob | undefined,
    stateMutator: Dispatch<SetStateAction<Blob | undefined>>,
    // the image saved before, shown until another one is chosen
    imageUrl?: string,
    className?: string
}

export { DragNDropImage }