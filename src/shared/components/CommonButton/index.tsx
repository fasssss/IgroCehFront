import { Button } from "@mui/material";
import { ReactNode, PropsWithChildren, MouseEventHandler } from "react";
import './styles.scss';

const CommonButton = (props: PropsWithChildren<ButtonProps>) => {
    return(
        <Button variant='contained' 
            className='common-button'
            startIcon={props.startIcon} 
            endIcon={props.endIcon} 
            onClick={props.onClick}
        >
            { props.children }
        </Button>
    );
}

type ButtonProps = {
    startIcon?: ReactNode,
    endIcon?: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>
}

export { CommonButton }