import { NextFunction, Request, Response, Router, RequestHandler } from "express";
import { BaseRoute } from "./route";


/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router, csrfProtection: RequestHandler) {
    

    //add home page route
    router.get("/",
      csrfProtection,
      (req: Request, res: Response, next: NextFunction) => {
        new IndexRoute().index(req, res, next);
      });
  }

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * The home page route.
   *
   * @class IndexRoute
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public index(req: Request, res: Response, next: NextFunction) {
    
    //var csrf = csrfProtection(req,res,next);
    res.cookie("XSRF-TOKEN", req.csrfToken());
    res.render("index.html");
  }
}