

/*cordova*/
declare var device;

import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Security } from '../../../server/common/security';



@Injectable({
    providedIn: 'root',
})
export class GooglePlusLoginService implements IGoogleLogin {



    constructor(private httpCaller: HttpCallerService) {
        /*cordova google plus */
        document.addEventListener('deviceready', function () {
            alert(device.platform);
        }, false);

    }

    public signIn(domainName) {
        window['plugins'].googleplus.login(
            {
                'scopes': Security.GoogleLoginScopes.join(' '),
                'webClientId': environment.clientId//'client id of the web app/server side', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                //'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
            },
            function (obj) {
                alert(JSON.stringify(obj)); // do something useful instead of alerting
            },
            function (err) {
                console.log(err);
            }
        );

    }

    public isSignedIn(domainName) {

    }

    public signOut() {

    }

    getAuthProfile() {
        throw new Error("Method not implemented.");
    }
}