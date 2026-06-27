"use client";

import {
  Admin,
  Resource,
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  DeleteButton,
  fetchUtils,
  type AuthProvider,
} from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

// ---------------------------------------------------------------------------
// httpClient — injects the admin JWT into every react-admin request
// ---------------------------------------------------------------------------
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetchUtils.fetchJson(url, { ...options, headers });
};

// ---------------------------------------------------------------------------
// dataProvider — points at /api/v1/admin/*
// ---------------------------------------------------------------------------
const dataProvider = simpleRestProvider(`${API_URL}/admin`, httpClient);

// ---------------------------------------------------------------------------
// authProvider
// ---------------------------------------------------------------------------
const authProvider: AuthProvider = {
  login: async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const { token } = (await res.json()) as { token: string };
    localStorage.setItem("admin_token", token);
  },

  logout: async () => {
    localStorage.removeItem("admin_token");
  },

  checkAuth: async () => {
    if (!localStorage.getItem("admin_token")) throw new Error("No token");
  },

  checkError: async (error: { status?: number }) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("admin_token");
      throw new Error("Unauthorized");
    }
  },

  getIdentity: async () => ({ id: "admin", fullName: "Admin" }),

  getPermissions: async () => "admin",
};

// ---------------------------------------------------------------------------
// Resource list components
// ---------------------------------------------------------------------------
function ChatLeadList() {
  return (
    <List>
      <Datagrid rowClick={false}>
        <TextField source="name" />
        <EmailField source="email" />
        <TextField source="query" label="First Query" />
        <DateField source="createdAt" label="Signed Up" showTime />
        <DeleteButton />
      </Datagrid>
    </List>
  );
}

// ---------------------------------------------------------------------------
// Root admin page
// ---------------------------------------------------------------------------
export default function AdminPage() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      basename="/admin"
    >
      <Resource
        name="chat-leads"
        list={ChatLeadList}
        options={{ label: "Chat Leads" }}
      />
    </Admin>
  );
}
