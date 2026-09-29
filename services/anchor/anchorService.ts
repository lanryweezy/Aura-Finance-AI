// Frontend Service talking to our Serverless Function
export const anchorService = {
  callApi: async (action: string, payload?: any) => {
    const response = await fetch('/api/anchor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Anchor API Error: ${response.status}`);
    }

    return response.json();
  },

  callApiGet: async (queryParams: Record<string, string>) => {
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await fetch(`/api/anchor?${queryString}`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Anchor API Error: ${response.status}`);
      }
      return response.json();
  }
};
