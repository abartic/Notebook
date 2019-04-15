

interface IGoogleLogin
{
    signIn(domainName, language);

    getUserProfile(refreshCsrf); 

    signOut();
}
