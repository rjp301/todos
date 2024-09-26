interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export default async function getGoogleUser(accessToken: string) {
  const fetchInit: FetchRequestInit = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };

  const user: GoogleUser = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    fetchInit,
  ).then((res) => res.json());

  return user;
}
