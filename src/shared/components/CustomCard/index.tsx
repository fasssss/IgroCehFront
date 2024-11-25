import Tilt from 'react-parallax-tilt';
import { MouseEventHandler, PropsWithChildren } from 'react';
import './styles.scss';

const CustomCard = ({ imageUrl, name, isShown = true, onClick, children }: PropsWithChildren<CustomCardPropType>) => {

    return(
        <div onClick={ onClick } className={`custom-card__card ${isShown ? "" : "flipped"}`}>
            <div className="custom-card__card-back">

            </div>
            <div className="custom-card__card-front">
                <Tilt 
                scale={ 1.05 } 
                tiltMaxAngleX={ 10 } 
                tiltMaxAngleY={ 10 } 
                perspective={ 990 } 
                className="custom-card__face"
                >
                    <img className="custom-card__image" src={ imageUrl } />
                    <div className="custom-card__name">
                        { name }
                    </div>
                    <div className="custom-card__body">
                        {
                            children
                        }
                    </div>
                </Tilt>
            </div>
        </div>
    );
}

type CustomCardPropType = {
    imageUrl?: string | undefined,
    name: string,
    isShown?: boolean,
    onClick?: MouseEventHandler<HTMLDivElement>
}

export { CustomCard }