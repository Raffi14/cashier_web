import { defaultConfig } from "@/envConfig";

const baseUrl = defaultConfig.webUrl;

export const httpGet = async (url: string, params?: any) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${url}${queryString}`, {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response
};

export const httpPost = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
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
    credentials: "include",
    body: JSON.stringify(data),
  });
  return response
};

export const httpDelete = async (url: string) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });
  return response;
};
