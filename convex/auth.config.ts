export default {
  providers: [
    {
      // Convex Auth issues its own tokens from this domain
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
