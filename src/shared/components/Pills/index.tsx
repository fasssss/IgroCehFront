import './styles.scss';

export type PillItem = {
    label: string,
    color?: string
}

const Pills = ({ items, className }: PillsProps) => {
    return(
        <div className={`pills ${className || ""}`}>
            {
                items.map(item =>
                    <span key={item.label} className='pills__item' style={item.color ? { backgroundColor: item.color } : undefined}>
                        { item.label }
                    </span>
                )
            }
        </div>
    );
}

type PillsProps = {
    items: PillItem[],
    className?: string
}

export { Pills }
