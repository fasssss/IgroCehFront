import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '@mui/material'
import { Logout, Person } from '@mui/icons-material';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { useGetUserObjectQuery, useLogoutMutation } from 'root/features/authorization/authorizationApi';
import { playerProfilePath } from 'root/features/players/playerProfilePath';
import { isUnauthorizedError } from 'root/shared/igroCehApi';
import i18n from 'root/shared/localization';
import './styles.scss';

function Layout() {
  const [isLanguageSelectorOpened, setIsLanguageSelectorOpened] = useState(false);
  const [isUserMenuOpened, setIsUserMenuOpened] = useState(false);
  const userMenu = useRef<HTMLDivElement>(null);
  const getUserObject = useGetUserObjectQuery();
  const [logout] = useLogoutMutation();
  const userInfo = getUserObject.data;
  const navigate = useNavigate()
  const { t } = useTranslation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setIsLanguageSelectorOpened(document.getElementsByClassName('layout__language-flag')[0] == e.target);
      if(!userMenu.current?.contains(e.target as Node)) {
        setIsUserMenuOpened(false);
      }
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

  const openProfile = () => {
    setIsUserMenuOpened(false);
    if(userInfo) {
      navigate(playerProfilePath(userInfo.id));
    }
  }

  const handleLogout = () => {
    setIsUserMenuOpened(false);
    logout();
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
          <div ref={userMenu} onMouseLeave={() => setIsUserMenuOpened(false)} className='layout__user'>
            <div onClick={() => setIsUserMenuOpened(!isUserMenuOpened)} className='layout__user-button'>
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
            <div className='layout__user-menu' style={!isUserMenuOpened ? { display: 'none', opacity: 0 } : {}}>
              <div className='layout__user-menu-bridge' />
              <div onClick={openProfile} className='layout__user-menu-option'>
                <Person fontSize='small' />
                { t('Profile') }
              </div>
              <div onClick={handleLogout} className='layout__user-menu-option'>
                <Logout fontSize='small' />
                { t('Log out') }
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='layout__content-container'>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
