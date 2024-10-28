import { Button, ButtonPropsColorOverrides } from "@mui/material";
import { OverridableStringUnion } from '@mui/types';
import { ReactNode, PropsWithChildren, MouseEventHandler } from "react";
import './styles.scss';

const CommonButton = (props: PropsWithChildren<ButtonProps>) => {
    return(
        <Button variant='contained' 
            className='common-button'
            startIcon={props.startIcon} 
            endIcon={props.endIcon} 
            onClick={props.onClick}
            color={props.color || "primary"}
        >
            <span className="common-button__text-alignment">
                { props.children }
            </span>
        </Button>
    );
}

type ButtonProps = {
    startIcon?: ReactNode,
    endIcon?: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>
    color?: OverridableStringUnion<"inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning", ButtonPropsColorOverrides> | undefined
}

export { CommonButton }