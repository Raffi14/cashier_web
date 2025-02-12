const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const httpGet = async (url: string, params?: any) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${baseUrl}${url}${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status == 200) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const httpPost = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response
};

export const httpPut = async (url: string, data: any) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const httpDelete = async (url: string) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
