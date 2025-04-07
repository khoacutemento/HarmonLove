export const handleImageProfile = (url) => {
  if (url && url.startsWith("https")) {
    return url; // Return the URL if it exists and starts with "https"
  } else {
    return "../../src/assets/images/profile_avatar.jpg"; // Return default app image if no URL or not "https"
  }
};

// Function to parse the user string and store it in localStorage
export const parseUserStringToObject = (userString) => {
  try {
    // Step 1: Validate input
    if (typeof userString !== "string" || !userString.trim()) {
      throw new Error("Invalid input: userString must be a non-empty string");
    }

    // Step 2: Extract the object part from the string
    // Assuming the format is "user: { accountId = ..., role = ..., username = ... }"
    const objectPart = userString.match(/{.*}/)?.[0];
    if (!objectPart) {
      throw new Error(
        "Invalid user string format: Could not extract object part",
      );
    }

    // Step 3: Replace = with : and add quotes around keys
    let cleanedObjectString = objectPart
      .replace(/=/g, ":") // Replace = with :
      .replace(/(\w+)\s*:/g, '"$1":'); // Add quotes around keys

    // Step 4: Add quotes around values, handling more complex strings (e.g., UUIDs with hyphens)
    cleanedObjectString = cleanedObjectString.replace(
      /: ([^,{}"\s]+)(?=[,}]|$)/g,
      (match, value) => {
        // Check if the value is a number (e.g., 0, 123, etc.)
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          return `: ${value}`; // Don't quote numbers
        }
        // Otherwise, treat it as a string and add quotes
        return `: "${value}"`;
      },
    );

    // Step 5: Parse the cleaned string into a JavaScript object
    console.log("Cleaned object string:", cleanedObjectString);
    const userObject = cleanedObjectString;

    return userObject;
  } catch (error) {
    console.error("Error parsing user string:", error.message);
    throw error; // Re-throw the error so the caller can handle it
  }
};

export const parseAndStoreUser = (userString) => {
  try {
    // Step 1: Validate input
    if (typeof userString !== "string" || !userString.trim()) {
      throw new Error("Invalid input: userString must be a non-empty string");
    }

    // Step 2: Clean the string to make it a valid JSON string
    let cleanedString = userString
      .trim()
      .replace(/=/g, ":") // Replace = with :
      .replace(/(\w+)\s*:/g, '"$1":'); // Add quotes around keys

    // Step 3: Add quotes around values, handling UUIDs, strings, and numbers
    cleanedString = cleanedString.replace(
      /: ([^,{}"\s][^,{}]*)(?=[,}]|$)/g,
      (match, value) => {
        // Check if the value is a number (e.g., 0, 123, etc.)
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          return `: ${value}`; // Don't quote numbers
        }
        // Otherwise, treat it as a string and add quotes
        return `: "${value}"`;
      },
    );

    // Step 4: Parse the cleaned string into a JavaScript object
    const userObject = JSON.parse(cleanedString);

    // Step 6: Rename the username key to userName
    if (userObject.username) {
      userObject.userName = userObject.username;
      delete userObject.username; // Remove the old username key
    }

    // Step 5: Validate the parsed object
    if (!userObject.accountId || !userObject.role || !userObject.userName) {
      throw new Error(
        "Parsed user object is missing required fields (accountId, role, username)",
      );
    }

    // Step 6: Store the JavaScript object in localStorage as a JSON string
    localStorage.setItem("user", JSON.stringify(userObject));

    // Step 7: Return the JavaScript object
    return userObject;
  } catch (error) {
    console.error("Error parsing or storing user data:", error.message);
    throw error; // Re-throw the error so the caller can handle it
  }
};
