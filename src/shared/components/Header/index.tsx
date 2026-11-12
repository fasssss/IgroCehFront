import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logout, Person } from "@mui/icons-material";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { SoonLabel } from "root/shared/components/SoonLabel";
import { useGetUserObjectQuery, useLogoutMutation } from "root/features/authorization/authorizationApi";
import { useGetActiveGlobalEventQuery } from "root/features/globalEvents/globalEventsApi";
import { playerProfilePath } from "root/features/players/playerProfilePath";
import logoMark from "root/assets/design/logo-mark.svg";
import iconEvent from "root/assets/design/icon-event.svg";
import iconEventActive from "root/assets/design/icon-event-active.svg";
import iconRanking from "root/assets/design/icon-ranking.svg";
import iconRankingActive from "root/assets/design/icon-ranking-active.svg";
import iconArrowDown from "root/assets/design/icon-arrow-down.svg";
import { buildNavigation, NavGroup, NavItem } from "./navigation";
import './styles.scss';

const GROUP_ICONS: Record<NavGroup['id'], { icon: string, active: string }> = {
    events: { icon: iconEvent, active: iconEventActive },
    ladder: { icon: iconRanking, active: iconRankingActive },
};

// languages are named in their own language, so everyone finds theirs
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
];

// a dropdown closes on a click outside of it and on Escape
const useDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if(!ref.current?.contains(e.target as Node)) setIsOpen(false);
        };
        const handleKey = (e: KeyboardEvent) => {
            if(e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    return { isOpen, setIsOpen, ref };
}

const Header = () => {
    const { t, i18n } = useTranslation();
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    const user = useGetUserObjectQuery().data;
    const activeGlobalEvent = useGetActiveGlobalEventQuery().data?.globalEvent;
    const [logout] = useLogoutMutation();
    const language = useDropdown();
    const userMenu = useDropdown();

    const groups = buildNavigation({
        pathname,
        tab: searchParams.get('tab'),
        userId: user?.id,
        activeGlobalEventId: activeGlobalEvent?.id
    });
    const expandedGroup = groups.find(group => group.isActive);

    // a menu stays open on another page only by mistake
    const { setIsOpen: setUserMenuOpen } = userMenu;
    useEffect(() => setUserMenuOpen(false), [pathname, setUserMenuOpen]);

    const currentLanguage = LANGUAGES.find(lang => i18n.resolvedLanguage === lang.code) ?? LANGUAGES[0];

    const renderItem = (item: NavItem) => {
        if(!item.to) {
            return(
                <span key={item.labelKey} className="header__item header__item--soon" aria-disabled="true">
                    {t(item.labelKey)}
                    <SoonLabel className="header__soon" />
                </span>
            );
        }

        return(
            <Link key={item.labelKey} to={item.to}
                className={`header__item ${item.isActive ? 'header__item--active' : ''}`}
                aria-current={item.isActive ? 'page' : undefined}
            >
                {t(item.labelKey)}
                {item.isActive && <span className="header__item-line" aria-hidden />}
            </Link>
        );
    }

    const renderGroupTitle = (group: NavGroup) => {
        const icons = GROUP_ICONS[group.id];
        return(
            <Link to={group.to} className="header__group-title" title={t(group.labelKey)}>
                <img src={group.isActive ? icons.active : icons.icon} className="header__group-icon" alt="" width={24} height={24} />
                <span className="header__group-label">{t(group.labelKey)}</span>
            </Link>
        );
    }

    return(
        <header className="header">
            <div className="header__bar">
                <div className="header__left">
                    <Link to="/" className="header__logo" aria-label={t('nav.mainPage')}>
                        <img src={logoMark} className="header__logo-mark" alt="" width={73} height={18} />
                        <span className="header__logo-text">
                            ИГРО<span className="header__logo-accent">ЦЕХ</span>
                        </span>
                    </Link>
                    <nav className="header__menu" aria-label={t('nav.mainMenu')}>
                        {
                            groups.map(group =>
                                group.isActive ?
                                <div key={group.id} className="header__group header__group--expanded">
                                    {renderGroupTitle(group)}
                                    <span className="header__separator" aria-hidden>|</span>
                                    <div className="header__items">{group.items.map(renderItem)}</div>
                                </div>
                                :
                                <div key={group.id} className="header__group">{renderGroupTitle(group)}</div>
                            )
                        }
                    </nav>
                </div>
                <div className="header__right">
                    <div ref={language.ref} className="header__dropdown">
                        <button type="button" className="header__language"
                            aria-haspopup="menu" aria-expanded={language.isOpen}
                            aria-label={t('nav.language')}
                            onClick={() => language.setIsOpen(!language.isOpen)}
                        >
                            {currentLanguage.code}
                            <img src={iconArrowDown} alt="" width={20} height={20}
                                className={`header__arrow ${language.isOpen ? 'header__arrow--open' : ''}`}
                            />
                        </button>
                        {
                            language.isOpen &&
                            <div role="menu" className="header__menu-list header__menu-list--language">
                                {
                                    LANGUAGES.map(lang =>
                                        <button key={lang.code} type="button" role="menuitemradio"
                                            aria-checked={lang.code === currentLanguage.code}
                                            className="header__menu-option"
                                            onClick={() => {
                                                i18n.changeLanguage(lang.code);
                                                language.setIsOpen(false);
                                            }}
                                        >
                                            <span className="header__menu-code">{lang.code}</span>
                                            {lang.name}
                                        </button>
                                    )
                                }
                            </div>
                        }
                    </div>
                    {/* the bell of the surveys (plan igroceh-surveys, B2) goes here */}
                    <div ref={userMenu.ref} className="header__dropdown header__user">
                        <button type="button" className="header__user-button"
                            aria-haspopup="menu" aria-expanded={userMenu.isOpen}
                            aria-label={t('nav.userMenu')}
                            onClick={() => userMenu.setIsOpen(!userMenu.isOpen)}
                        >
                            {
                                user?.avatarUrl ?
                                <img src={user.avatarUrl} className="header__avatar" alt="" width={40} height={40} />
                                :
                                <span className="header__avatar header__avatar--default">
                                    <SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>
                                </span>
                            }
                            <span className="header__user-name">{user?.userName}</span>
                        </button>
                        {
                            userMenu.isOpen &&
                            <div role="menu" className="header__menu-list header__menu-list--user">
                                {
                                    user &&
                                    <Link role="menuitem" to={playerProfilePath(user.id)} className="header__menu-option">
                                        <Person fontSize="small" />
                                        {t('Profile')}
                                    </Link>
                                }
                                <button type="button" role="menuitem" className="header__menu-option" onClick={() => logout()}>
                                    <Logout fontSize="small" />
                                    {t('Log out')}
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {
                // on a narrow screen the items of the expanded group go to a row of their own
                expandedGroup &&
                <nav className="header__subnav" aria-label={t(expandedGroup.labelKey)}>
                    {expandedGroup.items.map(renderItem)}
                </nav>
            }
        </header>
    );
}

export { Header }
