const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/tickets';

/**
 * Handles fetch HTTP requests and formats error messages cleanly
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  /**
   * Fetches tickets filtered by criteria
   * @param {object} filters - { status, priority, breached }
   */
  async fetchTickets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.breached !== undefined && filters.breached !== 'all') {
      params.append('breached', filters.breached);
    }

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * Fetches aggregate statistics
   */
  async fetchStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    return handleResponse(response);
  },

  /**
   * Creates a new support ticket
   * @param {object} ticketData - { subject, description, customerEmail, priority }
   */
  async createTicket(ticketData) {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });
    return handleResponse(response);
  },

  /**
   * Updates an existing ticket (subject, description, priority, and/or status)
   * @param {string} id - Ticket ID
   * @param {object} updateData - { subject, description, priority, status }
   */
  async updateTicket(id, updateData) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  /**
   * Deletes a support ticket
   * @param {string} id - Ticket ID
   */
  async deleteTicket(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};
export default api;
