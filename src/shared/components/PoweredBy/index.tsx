import { useTranslation } from 'react-i18next';
import videoGamesCriticLogo from 'root/assets/videogamescritic-logo.png';
import './styles.scss';

const VIDEO_GAMES_CRITIC_URL = 'https://videogamescritic.com';

const PoweredBy = ({ className, href = VIDEO_GAMES_CRITIC_URL }: PoweredByProps) => {
    const { t } = useTranslation();

    return(
        <a href={href} target='_blank' rel='noopener' className={`powered-by ${className || ""}`}>
            <span className='powered-by__text'>{ t('Powered by') }</span>
            <img src={videoGamesCriticLogo} alt='VideoGamesCritic' className='powered-by__logo' />
        </a>
    );
}

type PoweredByProps = {
    className?: string,
    // VideoGamesCritic asks to link the game page wherever its numbers are shown
    href?: string
}

export { PoweredBy }
