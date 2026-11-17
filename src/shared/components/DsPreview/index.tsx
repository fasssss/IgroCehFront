import { useState } from "react";
import { DsButton } from "../DsButton";
import { DsTabs } from "../DsTabs";
import { StatusPill } from "../StatusPill";
import { TagPill } from "../TagPill";
import { SoonLabel } from "../SoonLabel";
import './styles.scss';

// the showcase of the design system, only in the dev build (/ds-preview), to compare it with the Figma page
const COLORS = [
    'background-base', 'surface-raised', 'text-primary', 'text-secondary', 'border-default',
    'accent-brand', 'status-success', 'status-info', 'status-error', 'status-warning'
];
const TEXT_STYLES = ['display', 'h1', 'h2', 'h3', 'body', 'label', 'small', 'caption'];

const DsPreview = () => {
    const [tab, setTab] = useState<'games' | 'ladder' | 'guilds'>('games');

    return(
        <div className="ds-preview">
            <h1 className="ds-preview__title">ИГРОЦЕХ / UI kit</h1>

            <section className="ds-preview__section">
                <h2 className="ds-preview__heading">01 / Цвета</h2>
                <div className="ds-preview__colors">
                    {
                        COLORS.map(color =>
                            <div key={color}>
                                <div className="ds-preview__swatch" style={{ backgroundColor: `var(--${color})` }} />
                                <div className="ds-preview__caption">{color}</div>
                            </div>
                        )
                    }
                </div>
            </section>

            <section className="ds-preview__section">
                <h2 className="ds-preview__heading">02 / Типографика</h2>
                {
                    TEXT_STYLES.map(style =>
                        <div key={style} className="ds-preview__text-row">
                            <span className="ds-preview__caption">{style}</span>
                            <span className={`ds-preview__text ds-preview__text--${style}`}>Игры объединяют</span>
                        </div>
                    )
                }
            </section>

            <section className="ds-preview__section">
                <h2 className="ds-preview__heading">04 / Кнопки</h2>
                <div className="ds-preview__row">
                    <DsButton>Показать ещё</DsButton>
                    <DsButton disabled>Показать ещё</DsButton>
                    <DsButton variant="primary">Показать ещё</DsButton>
                    <DsButton variant="primary" disabled>Показать ещё</DsButton>
                    <DsButton variant="filled" size="large">Steam</DsButton>
                    <DsButton size="large">Xbox</DsButton>
                    <DsButton uppercase to="/ds-preview">Ссылка-кнопка</DsButton>
                </div>
                <DsButton uppercase fullWidth>Показать ещё</DsButton>
            </section>

            <section className="ds-preview__section">
                <h2 className="ds-preview__heading">Вкладки</h2>
                <DsTabs label="Вкладки" value={tab} onChange={setTab}
                    tabs={[
                        { id: 'games', label: 'Мои игры' },
                        { id: 'ladder', label: 'Ладдер', after: <SoonLabel /> },
                        { id: 'guilds', label: 'Сообщества' },
                    ]}
                />
            </section>

            <section className="ds-preview__section">
                <h2 className="ds-preview__heading">Статусы и капсулы</h2>
                <div className="ds-preview__row">
                    <StatusPill status="success">Пройдено</StatusPill>
                    <StatusPill status="info">В процессе</StatusPill>
                    <StatusPill status="error">Не пройдено</StatusPill>
                    <StatusPill status="warning">Ожидает</StatusPill>
                </div>
                <div className="ds-preview__row">
                    <TagPill color="#7296e4">PS5</TagPill>
                    <TagPill>Геймплей</TagPill>
                    <TagPill variant="tint" tone="success">Шутеры</TagPill>
                    <TagPill variant="tint" tone="error">Спорт</TagPill>
                    <SoonLabel />
                </div>
            </section>
        </div>
    );
}

export default DsPreview;
