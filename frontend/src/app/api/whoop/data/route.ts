export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get("access_token");
  if (!access_token) {
    return new Response(JSON.stringify({ error: "Missing access_token" }), {
      status: 400,
    });
  }
  try {
    const whoopRes = await fetch("https://api.whoop.com/users/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const whoopData = await whoopRes.json();
    return new Response(JSON.stringify(whoopData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}
