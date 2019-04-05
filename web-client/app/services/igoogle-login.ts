

interface IGoogleLogin
{
    getAuthProfile(): any;
    
    signIn(domainName);

    isSignedIn(domainName);

    signOut();
}
