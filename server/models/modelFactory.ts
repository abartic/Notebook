
import { BaseEntity } from './base-entity';
import { Article } from './article';
import { Partner } from './partner';

export class ModelFactory {
    private static _uniqueInstance: ModelFactory;

    public create(type: string) {
        if (type === "Article") return new Article();
        else if (type === "Partner") return new Partner();
    }

    public static get uniqueInstance() : ModelFactory {
        if (ModelFactory._uniqueInstance === undefined) {
            ModelFactory._uniqueInstance = new ModelFactory();
        }
        return ModelFactory._uniqueInstance;
    }
}