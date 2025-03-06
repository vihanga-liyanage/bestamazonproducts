const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const syncUser = async (user: any) => {
  if (!user) return;

  const userId = user.id;
  const name = user.fullName || "Unknown User";
  const email = user.primaryEmailAddress?.emailAddress || "";

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);

    if (response.ok) {
      const existingUser = await response.json();
      if (existingUser.name !== name || existingUser.email !== email) {
        await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
      }
    } else if (response.status === 404) {
      await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name, email }),
      });
    }
  } catch (error) {
    console.error("Error syncing user:", error);
  }
};
