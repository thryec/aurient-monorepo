export async function GET(request: Request) {
  const redirectUri = encodeURIComponent(process.env.WHOOP_REDIRECT_URI || "");
  const clientId = process.env.WHOOP_CLIENT_ID;
  const url = `https://api.whoop.com/oauth/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read`;
  return Response.json({ url });
}
