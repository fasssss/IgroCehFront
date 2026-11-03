import icons from 'root/assets/icons.svg?raw'

const SvgSelector  = ({ iconName, height, width }: SvgSelectorProps) => { 
    const container = document.createElement('div');
    container.innerHTML = icons;
    const SvgIconElement = container.getElementsByClassName(iconName || "")[0];
    // an icon this front doesn't have, e.g. of a platform it doesn't know yet, draws nothing
    if(!SvgIconElement) {
        return null;
    }

    const heightImage = height || SvgIconElement.getAttribute('height') as string | number | undefined;
    const widthImage = width || SvgIconElement.getAttribute('width') as string | number | undefined;

    return(
        <svg height={heightImage} width={widthImage} dangerouslySetInnerHTML={{__html: SvgIconElement.outerHTML}} />
    );
}

type SvgSelectorProps = {
    iconName: string | undefined
    height?: string,
    width?: string
}

export { SvgSelector }