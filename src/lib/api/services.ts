const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getServiceLimit = async () => {
  const res = await fetch(`${baseUrl}/services-limit`, {
    cache: "no-store",
  });
  return res.json();
};
