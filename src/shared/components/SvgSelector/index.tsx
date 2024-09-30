import icons from 'root/assets/icons.svg'

const SvgSelector  = ({ iconName }: SvgSelectorProps) => { 
    const container = document.createElement('div');
    container.innerHTML = icons;
    const SvgIconElement = container.getElementsByClassName(iconName || "")[0];
    const height = SvgIconElement.getAttribute('height') as string | number | undefined;
    const width = SvgIconElement.getAttribute('width') as string | number | undefined;

    return(
        <svg height={height} width={width} dangerouslySetInnerHTML={{__html: SvgIconElement.outerHTML}} />
    );
}

type SvgSelectorProps = {
    iconName: string | undefined
}

export { SvgSelector }