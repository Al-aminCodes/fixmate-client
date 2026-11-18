const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const getUserByEmail = async (email: string) => {
  const res = await fetch(`${baseUrl}/user/${email}`, {
    cache: "no-store",
  });
  return res.json();
};
