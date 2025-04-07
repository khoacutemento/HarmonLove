export const handleImageProfile = (url) => {
  if (url && url.startsWith("https")) {
    return url; // Return the URL if it exists and starts with "https"
  } else {
    return "../../src/assets/images/profile_avatar.jpg"; // Return default app image if no URL or not "https"
  }
};
