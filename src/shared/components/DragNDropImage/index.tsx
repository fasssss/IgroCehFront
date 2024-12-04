import './styles.scss';
import { SvgSelector } from '../SvgSelector';
import { useEffect, useRef, useState } from 'react';

const DragNDropImage = () => {
    //const [hasImage, setHasImage] = useState(false);
    const [imgSrc, setImgSrc] = useState("");
    const inputFile = useRef<HTMLInputElement | null>(null);
    const dragNDropElement = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            var item = Array.from(e.clipboardData?.items || []).find(x => /^image\//.test(x.type));
            var blob = item?.getAsFile();
            if(blob) {
                setImgSrc(URL.createObjectURL(blob || new Blob()));
            }
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            var blob = Array.from(e.dataTransfer?.files || []).find(x => /^image\//.test(x.type))
            if(blob) {
                setImgSrc(URL.createObjectURL(blob || new Blob()));
            }
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        }

        const handleDialogOpen = () => {
            inputFile.current?.click();
        }

        const handleDialogSubmit = (e: Event) => {
            var blob = Array.from((e.target as HTMLInputElement).files || []).find(x => /^image\//.test(x.type))
            if(blob) {
                setImgSrc(URL.createObjectURL(blob || new Blob()));
            }
        }

        document.addEventListener("paste", handlePaste);
        document.addEventListener("drop", handleDrop);
        document.addEventListener("dragover", handleDragOver);
        dragNDropElement.current?.addEventListener("click", handleDialogOpen);
        inputFile.current?.addEventListener("change", handleDialogSubmit);

        return(() => {
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("drop", handleDrop);
            document.removeEventListener("dragover", handleDragOver);
            dragNDropElement.current?.removeEventListener("click", handleDialogOpen);
            inputFile.current?.removeEventListener("change", handleDialogSubmit);
            if(inputFile.current)
                inputFile.current.value = "";
        })
    }, [])

    return(
    <div ref={dragNDropElement} className="drag-n-drop">
        <input type='file' id='file' ref={inputFile} style={{display: 'none'}}/>
        {
            !imgSrc ?
            <div className="drag-n-drop__placeholder">
                {
                    <SvgSelector iconName="image-icon" />
                }
                Drag or Ctrl-V to paste
            </div>
            :
            <img src={imgSrc}/>
        }
    </div>
    );
};

export { DragNDropImage }