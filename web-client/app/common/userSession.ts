export class UserSession {
    public Username: string;
    public Language: string = 'en';
    public DomainId: string;
    public DomainName: string;
    public LastAuthTime: string;
    public WaitingForAction? : boolean;
  }