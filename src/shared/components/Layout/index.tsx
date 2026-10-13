import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SvgIcon } from '@mui/material'
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { useGetUserObjectQuery } from 'root/features/authorization/authorizationApi';
import { isUnauthorizedError } from 'root/shared/igroCehApi';
import i18n from 'root/shared/localization';
import './styles.scss';

function Layout() {
  const [isLanguageSelectorOpened, setIsLanguageSelectorOpened] = useState(false);
  const getUserObject = useGetUserObjectQuery();
  const userInfo = getUserObject.data;
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setIsLanguageSelectorOpened(document.getElementsByClassName('layout__language-flag')[0] == e.target);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // language names are written in their own language, so everyone can find theirs
  const getCountryBadge = (countryCode: string) => {
    if(countryCode === 'en')
    {
      return(
        <div className='layout__language-flag'>English &nbsp;<SvgSelector iconName='american-flag'/></div>
      );
    }

    if(countryCode === 'ru')
      {
        return(
          <div className='layout__language-flag'>Русский &nbsp;<SvgSelector iconName='russian-flag'/></div>
        );
      }
  }

  if(isUnauthorizedError(getUserObject.error)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="layout">
        <div id='layout__decoration-1'/>
        <div id='layout__decoration-2'/>
        <div id='layout__decoration-3'/>
        <div id='layout__decoration-4'/>
        <div id='layout__decoration-5'/>
        <div id='layout__decoration-6'/>
        <div className='layout__logo' onClick={() => navigate('/')}>
          <h2>Igro Ceh</h2>
        </div>
        <div className='layout__user-badge'>
          <div className='layout__language'>
            <div onClick={() => setIsLanguageSelectorOpened(!isLanguageSelectorOpened)} className='layout__language-button'>
              {
                getCountryBadge(i18n.language)
              }
            </div>

            {
              <div className='layout__language-selector' style={!isLanguageSelectorOpened ? { display: 'none', opacity: 0}: {}}>
                {
                  ["en", "ru"].map((value) => {
                    return(
                      <div key={value}
                        onClick={() => {
                          i18n.changeLanguage(value);
                          setIsLanguageSelectorOpened(false)
                        }}
                        className='layout__language-option'
                      >
                        { getCountryBadge(value) }
                      </div>
                    );
                  })
                }
              </div>
            }
          </div>
          {
            userInfo?.avatarUrl ?
            <img src={userInfo.avatarUrl} className='layout__user-avatar'></img>
            :
            <div className='layout__default-avatar'>
              <SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>
            </div>
          }
          <span>{userInfo?.userName}</span>
        </div>
      </div>
      <div className='layout__content-container'>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
