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
import * as session from 'express-session';
import { IndexRoute } from './routes/index';
import { PassportManager } from './passport-manager/passport-manager';
import * as Config from 'config';
import { AppAcl } from './acl/app-acl'
import helmet = require('helmet');
import csrf = require('csurf');


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
        // this.app.use(express.static(__dirname));

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

        this.app.use(cookieSession({ name: 'session', keys: [Config.get<string>('cookieSecret')] }));

        this.app.set('trust proxy', 1) // trust first proxy
        var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        this.app.use(session({
            secret: Config.get<string>("cookieSecret"),
            resave: true,
            saveUninitialized: true,
            name: 'sessionId',
            cookie: {
                secure: true,
                httpOnly: true,
                //domain: 'example.com',
                //path: 'foo/bar',
                expires: expiryDate
            }
        }));

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

        var csrfProtection = csrf({ cookie: true, ignoreMethods : ['GET','HEAD', 'OPTIONS'] })
        
        // IndexRoute
        IndexRoute.create(router, csrfProtection);

        //login route
        LoginRoute.create(router, this.passportManager, csrfProtection);

        SheetRoute.create(router);

        // use router middleware
        this.app.use(router);
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
                res.render('pageFault.html', { url: req.url })
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
