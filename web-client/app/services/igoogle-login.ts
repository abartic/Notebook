

interface IGoogleLogin
{
    signIn(domainName, language); // : Promise<UserSession>;

    getUserProfile(); // : Promise<UserSession>;

    signOut();
}
