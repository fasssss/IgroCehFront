import icons from 'root/assets/icons.svg'

const SvgSelector  = ({ iconName }: SvgSelectorProps) => { 
    const container = document.createElement('div');
    container.innerHTML = icons;
    const SvgIconElement = container.getElementsByClassName(iconName || "")[0];

    return(
        <span dangerouslySetInnerHTML={{__html: SvgIconElement.outerHTML}} />
    );
}

type SvgSelectorProps = {
    iconName: string | undefined
}

export { SvgSelector }