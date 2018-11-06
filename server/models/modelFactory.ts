import { Budget } from './budget';
import { Receivable } from './receivable';
import { Payment } from './payment';
import { BaseEntity } from './base-entity';
import { Article } from './article';
import { Partner } from './partner';
import { Address } from './address';
import { InvoiceLine } from './invoice-line';
import { Invoice } from './invoice';
import { Store } from './store';
import { Contact } from './contact';
import { ArticleInventory } from './article-inventory';
import { Company } from './company';
import { Prospect } from './prospect';
import { Purchase } from './purchase';
import { PurchaseLine } from './purchase-line';
import { AccountInventory } from './account-inventory';
import { BudgetLine } from './budget-line';
import { Expenses } from './expenses';
import { ExpenseLine } from './expense-line';

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
         else if (type === "prospect") return Prospect;
         else if (type === "address") return Address;
         else if (type === "articleinventory") return ArticleInventory;
         else if (type === "accountinventory") return AccountInventory;
         else if (type === "contact") return Contact;
         else if (type === "store") return Store;
         else if (type === "invoice") return Invoice;
         else if (type === "invoiceline") return InvoiceLine;
         else if (type === "purchase") return Purchase;
         else if (type === "purchaseline") return PurchaseLine;
         else if (type === "company") return Company;
         else if (type === "payment") return Payment;
         else if (type === "receivable") return Receivable;
         else if (type === "budget") return Budget;
         else if (type === "budgetline") return BudgetLine;
         else if (type === "expenses") return Expenses;
         else if (type === "expenseline") return ExpenseLine;
         else throw 'type is missing'
    }

    public static get uniqueInstance() : ModelFactory {
        if (ModelFactory._uniqueInstance === undefined) {
            ModelFactory._uniqueInstance = new ModelFactory();
        }
        return ModelFactory._uniqueInstance;
    }
}