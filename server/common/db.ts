
// import * as Config from "config";
// import * as  Sequelize from "sequelize";



// export class Db {

//     public sequelize: Sequelize.Sequelize = null;

//     private static dbInstance: Db;

//     static get instance(): Db {
//         if (Db.dbInstance === undefined) {
//             Db.dbInstance = new Db();
//         }
//         return Db.dbInstance;
//     }

//     private constructor() {

//         this.sequelize = new Sequelize(
//             Config.get<string>("dbConfig.database"), 
//             Config.get<string>("dbConfig.username"),
//             Config.get<string>("dbConfig.password"),
//             {
//                 host: Config.get<string>("dbConfig.host"),
//                 port: Config.get<number>("dbConfig.port"),
//                 dialect: Config.get<string>("dbConfig.dialect"),
//                 dialectOptions: {
//                     "ssl": Config.get<string>("dbConfig.ssl") 
//                 }
//             }
//         );

//     }
// }

