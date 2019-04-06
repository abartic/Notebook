import { InjectionToken, inject } from '@angular/core';
import { GoogleLoginService } from './google-login-service';
import { GooglePlusLoginService } from './google-plus-login-service';
import { environment } from '../../environments/environment';


export const GOOGLE_LOGIN_SERV = new InjectionToken<IGoogleLogin>('google serv type',
    {
        providedIn: 'root',
        factory: () => {return environment.mobile === true ? inject(GooglePlusLoginService) : inject(GoogleLoginService)}
    });

