import { SoonLabel } from "root/shared/components/SoonLabel";
import './styles.scss';

// a tab of the profile that isn't made yet
const ProfileSoon = ({ title, text }: ProfileSoonProps) => {
    return(
        <div className="profile-soon">
            <h2 className="profile-soon__title">{title} <SoonLabel /></h2>
            <p className="profile-soon__text">{text}</p>
        </div>
    );
}

type ProfileSoonProps = {
    title: string,
    text: string
}

export { ProfileSoon }
