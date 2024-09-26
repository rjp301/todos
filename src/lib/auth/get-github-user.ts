interface GithubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string;
}

export default async function getGithubUser(accessToken: string) {
  const fetchInit: FetchRequestInit = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };

  const [user, emails] = await Promise.all<
    [Promise<GithubUser>, Promise<GithubEmail[]>]
  >([
    fetch("https://api.github.com/user", fetchInit).then((res) => res.json()),
    fetch("https://api.github.com/user/emails", fetchInit).then((res) =>
      res.json(),
    ),
  ]);

  const primaryEmail = emails.find((email) => email.primary && email.verified);
  if (!primaryEmail) {
    throw new Error("Primary email not found");
  }

  return {
    ...user,
    email: primaryEmail.email,
  };
}
