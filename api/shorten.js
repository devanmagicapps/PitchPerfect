export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    const response = await fetch("https://api.dub.co/links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DUB_CO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Failed to shorten link" });
    }

    return res.status(200).json({ shortUrl: data.shortLink });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
