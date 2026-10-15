import { useTranslation } from 'react-i18next';
import videoGamesCriticLogo from 'root/assets/videogamescritic-logo.png';
import './styles.scss';

const VIDEO_GAMES_CRITIC_URL = 'https://videogamescritic.com';

const PoweredBy = ({ className }: PoweredByProps) => {
    const { t } = useTranslation();

    return(
        <a href={VIDEO_GAMES_CRITIC_URL} target='_blank' rel='noopener' className={`powered-by ${className || ""}`}>
            <span className='powered-by__text'>{ t('Powered by') }</span>
            <img src={videoGamesCriticLogo} alt='VideoGamesCritic' className='powered-by__logo' />
        </a>
    );
}

type PoweredByProps = {
    className?: string
}

export { PoweredBy }
