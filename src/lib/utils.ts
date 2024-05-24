import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth"
export const authOptions: AuthOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.readonly",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, user, account }: { token: any, user: any, account: any }) {
            if (account && user) {
                token.accessToken = account.access_token
                token.access_token_id = account.id_token
                token.refresh_token = account.refresh_token
                token.id = user.id
                return token
            }
            const verifyFetch = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token!.access_token_id}`)
            const verifyData = await verifyFetch.json()
            if (verifyData.error) {
                console.log('next auth access token expired')
                const fetchNew = await fetch(`https://oauth2.googleapis.com/token`, {
                    method: 'POST', body: JSON.stringify({
                        "refresh_token": `${token!.refresh_token}`,
                        "client_id": `${process.env.GOOGLE_CLIENT_ID}`,
                        "client_secret": `${process.env.GOOGLE_CLIENT_SECRET}`,
                        "grant_type": "refresh_token"
                    }), headers: { 'Content-Type': 'application/json' }
                })
                const newTokens = await fetchNew.json()
                console.log(newTokens)
                if (newTokens.error) {
                    console.log('new tokens error')
                    return { ...token, error: 'login again' }
                }
                const { access_token, id_token } = newTokens
                console.log('setting new tokens')
                return { ...token, accessToken: access_token, access_token_id: id_token }
            }
            else {
                console.log('access token is valid')
                return token
            }
        },
        async session({ session, token }: { session: any, token: any }) {
            session.user.id = token.id
            return { ...session, ...token }

        }
    },
    pages: {
        signIn: '/'
    },
    secret: process.env.NEXTAUTH_SECRET
}