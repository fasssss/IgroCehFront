import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { playerProfilePath } from "root/features/players/playerProfilePath";
import { REVIEWS_PATH } from "root/features/reviews/reviewPath";
import footerDots from "root/assets/design/footer-dots.svg";
import footerLogoMark from "root/assets/design/footer-logo-mark.svg";
import iconEvent from "root/assets/design/icon-event.svg";
import iconCommunity from "root/assets/design/icon-community.svg";
import iconThreeStars from "root/assets/design/icon-three-stars.svg";
import './styles.scss';

const FIRST_YEAR = 2024;

// the footer of the layouts (20648:1353) with the links that lead somewhere: the season, the ratings, the blog,
// the news and the contacts are left out until they exist; the reviews are reached only from here
const Footer = () => {
    const { t } = useTranslation();
    const user = useCurrentUser();

    const links = [
        { to: '/', icon: iconEvent, labelKey: 'nav.events' },
        { to: '/', icon: iconCommunity, labelKey: 'nav.communities' },
        { to: REVIEWS_PATH, icon: iconThreeStars, labelKey: 'nav.gameReviews' },
    ];

    return(
        <footer className="footer">
            <div className="footer__dots" aria-hidden>
                <img src={footerDots} alt="" width={2426} height={42} className="footer__dots-image" />
            </div>
            <div className="footer__content">
                <div className="footer__about">
                    <Link to="/" className="footer__logo" aria-label={t('nav.mainPage')}>
                        <img src={footerLogoMark} alt="" width={27} height={32} />
                        <span className="footer__logo-text">
                            ИГРО<span className="footer__logo-accent">ЦЕХ</span>
                        </span>
                    </Link>
                    <div className="footer__about-text">
                        <div className="footer__copyright">
                            © ИГРОЦЕХ <span className="footer__copyright-line" aria-hidden>|</span> {FIRST_YEAR}–{new Date().getFullYear()}
                        </div>
                        <p className="footer__description">{t('footer.about')}</p>
                    </div>
                </div>
                <nav className="footer__menu" aria-label={t('footer.menu')}>
                    <ul className="footer__links">
                        {
                            links.map(link =>
                                <li key={link.labelKey}>
                                    <Link to={link.to} className="footer__link">
                                        <img src={link.icon} alt="" width={24} height={24} className="footer__link-icon" />
                                        {t(link.labelKey)}
                                    </Link>
                                </li>
                            )
                        }
                    </ul>
                    {
                        user &&
                        <ul className="footer__links">
                            <li>
                                <Link to={playerProfilePath(user.id)} className="footer__link footer__link--secondary">
                                    {t('nav.myAccount')}
                                </Link>
                            </li>
                        </ul>
                    }
                </nav>
            </div>
        </footer>
    );
}

export { Footer }
