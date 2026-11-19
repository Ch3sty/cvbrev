// /auth/app/bekrafta
//
// Samma verifiering som /auth/confirm, under den prefix som appens App Links
// öppnar i appen (mobilapp/android AndroidManifest, /auth/app/). Länkar i
// mejl som begärts från appen pekar hit, så att de öppnas i appen när den är
// installerad och i webbläsaren annars.

export { GET } from '../../confirm/route'
