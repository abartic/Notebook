import { BaseEntity } from './base-entity';
import { Article } from './article';
import { Partner } from './partner';
import { Address } from './address';
import { DocumentLine } from './document-line';
import { Document } from './document';
import { Store } from './store';
import { Contact } from './contact';
import { ArticleInventory } from './article-inventory';

export class ModelFactory {
    private static _uniqueInstance: ModelFactory;

    public create(type: string) {
        let entity = this.get(type);
        return new entity();
    }
    

    public get(type: string) : (new() => any ) {
        
        type = type.toLowerCase();
         if (type === "article") return Article;
         else if (type === "partner") return Partner;
         else if (type === "address") return Address;
         else if (type === "articleinventory") return ArticleInventory;
         else if (type === "contact") return Contact;
         else if (type === "store") return Store;
         else if (type === "document") return Document;
         else if (type === "documentline") return DocumentLine;
    }

    public static get uniqueInstance() : ModelFactory {
        if (ModelFactory._uniqueInstance === undefined) {
            ModelFactory._uniqueInstance = new ModelFactory();
        }
        return ModelFactory._uniqueInstance;
    }
}