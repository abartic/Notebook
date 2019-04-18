

interface IGoogleLogin
{
    signIn(domainName, language);

    getUserProfile(initCsrf); 

    signOut();
}
