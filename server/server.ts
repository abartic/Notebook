import { SheetRoute } from './routes/sheets_route';
import { LoginRoute } from './routes/login_route';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import cookieSession = require('cookie-session');
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';

import * as ejs from 'ejs';
import * as methodOverride from 'method-override';
//import * as session from 'express-session';
import { IndexRoute } from './routes/index';
import { PassportManager } from './passport-manager/passport-manager';
import * as Config from 'config';
import { AppAcl } from './acl/app-acl'
import helmet = require('helmet');
import csrf = require('csurf');
var CronJob = require('cron').CronJob;
let google = require('googleapis');

/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;
    passportManager: PassportManager = null;
    // tslint:disable-next-line:typedef-whitespace


    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        // tslint:disable-next-line:comment-format
        //create expressjs application
        this.app = express();

        // configure application
        this.config();

        // add routes
        this.routes();

        // add api
        this.api();

        this.setErrorHandler();
    }

    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    public api() {
        // empty for now
    }



    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    public config() {


        // add static paths
        this.app.use(express.static(path.join(__dirname, 'app')));
        this.app.use(express.static(path.join(__dirname)));

        this.app.set('views', path.join(__dirname, 'app/views'));
        // this.app.set("views",__dirname);

        // this.app.set("view engine", "pug");
        this.app.set('view engine', 'ejs');
        this.app.engine('html', ejs.renderFile);
        // use logger middlware
        this.app.use(logger('dev'));

        // use json form parser middlware
        this.app.use(bodyParser.json());

        // use query string parser middlware
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        // use cookie parker middleware middlware
        this.app.use(cookieParser(Config.get<string>('cookieSecret')));

        let cookieSessionConfing = <CookieSessionInterfaces.CookieSessionOptions>{
            name: 'session',
            keys: [Config.get<string>('cookieSecret')],
            maxAge: 60 * 60 * 1000 // 1 hour,
        };
        this.app.use(cookieSession(cookieSessionConfing));

        this.app.set('trust proxy', 1) // trust first proxy
        //var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        // this.app.use(session({
        //     secret: Config.get<string>("cookieSecret"),
        //     resave: true,
        //     saveUninitialized: true,
        //     name: 'sessionId',
        //     cookie: {
        //         secure: true,
        //         httpOnly: true,
        //         //domain: 'example.com',
        //         //path: 'foo/bar',
        //         expires: expiryDate
        //     }
        // }));

        // use override middlware
        this.app.use(methodOverride());
        this.app.use(helmet());

        // catch 404 and forward to error handler


        this.passportManager = new PassportManager();
        this.passportManager.config();
        this.app.use(this.passportManager.init());
        this.app.use(this.passportManager.session());
    }

    /**
     * Create router
     *
     * @class Server
     * @method api
     */
    public routes() {
        let router: express.Router;
        router = express.Router();

        var csrfProtection = csrf({ cookie: true, ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] })

        // IndexRoute
        IndexRoute.create(router, csrfProtection);

        //login route
        LoginRoute.create(router, this.passportManager, csrfProtection);

        SheetRoute.create(router);

        // use router middleware
        this.app.use(router);

        new CronJob('20 * * * * *', function () {

            // configure a JWT auth client
            let jwtClient = new google.auth.JWT(
                "test-service@reporter-184014.iam.gserviceaccount.com",
                null,
                "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDe8fopalEtTtZl\nM2wT4s/sMVSSyfJ6TRlfHvIOVcAidQL6CU7KwH85gHPCreWuGaIRkVYpZckFcFtw\n/QQEmSlDWeT/zwYmUfzNaIpNI77kWgAaxrYC94v+KBQJEiyQxz4ptZs6wAEYwuGy\niQrv5yUivrTfcGBZbvYvHrsiNBChq5KJNXL7jVMogd3r3LmkP8HHFgUJMF1fK+ZJ\na29PWqbTXLqLzrHNN3me8T/5B4ACRoDBUtG8qm2oja0WkpimFTKvgu0WWsTjGfF/\noLryBeMsrukmpUZMe/fS3ccPbE9boQYs+lNqBpnH5PG+OJhTeP7zxjya6q2oMVmh\nIrRwRlufAgMBAAECggEAXa86S7gA97SW1Dz5EBwx+lM6clqJWcpXPIkA93QiQniA\nMTjDEuE0NSIcwvSXPQNJfu9fURMUF4SA8GhqDVKdK8+1Mqe4slamkFx7LXI1b7jA\nLYBOEM4cVkdaL/uinY4UOau2WMhBTbnq5L7AyVIM4V5ZHEGZQ0ulCOT1hyhwyrZJ\nE7FcVe91KOsmyH0TMqFahWQHZtOtTq3j7tNkiltOOPiKSzQRWmHJJXzjekvl8lCx\nTf/kKCikZJr2gLo5aeSeCVd2gYzq8PlbdVtR64JIEJl6onx8tE+x2W2F8FKAjHmG\nm+VxEtkTKMApm7hEhBVdI5jW/7Qzg+cqeWCbLm7ozQKBgQDzK4kjCaVO6QYrXjlu\nijeKM0qY86og4tSxrHJrCyowUiCLqahb43K2GFKz2A4Nrk566A26EG/JOSopsqZW\n7EajEau3VqYu8GvkkUkZeUOuBeij/RTcvLhMZNg7XjvOQnIe5dshYemUExv3AnWN\n5FWuFQUmlGp90Ueuhx2CQYpKYwKBgQDqtUR1xDz/UogrpJXxZVmwLY9DGbreFFtO\n/OIUpwXloM9uCVBhNAt/2uAl0XSFGUiWgKgMfoKFabXamLYVopE25M3pNladfOGq\nbT7B5sf3NK0FUJ1H0LW/bt02c5/UzVRMpgkYWEmpDXMRzBmswynK/3dVL1SVSs9z\nbKY9UFewlQKBgQCrqp5jp9mVvZfnYdt1mAnhfJg7JjmCgd/Zln4n53ffKPtk3V7H\nj+hZeQ5ZfDtfmSA6UDvwkM355mtHiKE5WA/96umownkLRhtE/vP2Ec+fuPglXPMv\naeNJux+TudDKqcna2jY6eN7m9B6X4JqQkxORk7FRLRGIxQevxB8m55HzNQKBgQDl\nwyWNk9mSqJyc/LW8ZlbyXOdN7LY+CPeJz40SYp8nN9FYCs4hGe3X79BVtUG3uhSR\nIMlh0ca8C8v2fmBhtY8qibn5fzQzX7kaOW+iKeW/XlWySkRttSb2i/UKBQ6GJ6tK\njY+BwYv6biwjVAYeVb9n9cZAIeFPdLi4abgjda8iMQKBgQDTa/Oj+cH3npNkDQiR\nRIJJ7wfGw1D1kXX2dyO9bNIe6KN3lDVKSrm3LXIpvQLfkMzcb9E83RpqoDGSXAri\nyh0wGOF2rOGuWLahlLseKtD6WPaN6VEr+zx4cAtjlRRH58/4QF3FUIzB3sw2lSm5\nKtUvW5+pMtLpfjPhH/uIRucHvQ==\n-----END PRIVATE KEY-----\n",
                ['https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive']);

            //authenticate request
            jwtClient.authorize(function (err, tokens) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log(tokens);


                }
            });

        }, null, true, 'America/Los_Angeles');
    }

    setErrorHandler() {

        //errors handler
        this.app.use(
            (err, req, res, next) => {
                console.error(err);
                console.error(err.stackTrace);

                if (err.errorCode === 401) {
                    res.render('unauthorized.html', { error: err })
                }
                else if (err.errorCode === 'EBADCSRFTOKEN') {
                    res.status(403)
                    res.send('form tampered with')
                }
                else {
                    res.status(500)
                    res.render('error.html', { error: err })
                }
            }
        );

        this.app.use(function (req, res, next) {
            res.status(404);

            // respond with html page
            if (req.accepts('html')) {
                res.render('index.html', { url: req.url })
                return;
            }

            // respond with json
            if (req.accepts('json')) {
                res.send({ error: 'Not found' });
                return;
            }

            // default to plain-text. send()
            res.type('txt').send('Not found');
        });
    }
}
