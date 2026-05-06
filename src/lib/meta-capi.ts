// Meta Conversion API (CAPI) server-side helper
// Sends events directly from server to Facebook for redundancy + iOS 14.5+ tracking

const PIXEL_ID = "1417707616223656";
const ACCESS_TOKEN =
  "EAAUX64avpZAsBRasx17KIqhuUl8dZBIPhf4p0St9yRBJp8WeU2EykipDjRhPQxlXZCZAvbO51ahDy1QPhya7Y7MTy6T9ZBlaXickhVhyjQoBNkHzG1KW8ZBVml9bsS7vX4k0sgiiLNKdwo0ub2kqZC7gXxOOs9f3AtdigC4isaz4XH9YoKcwedeA2TSCrslygZDZD";

const CAPI_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;

export interface CapiEventData {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: "website" | "app" | "email" | "other" | "phone_call" | "chat" | "physical_store";
  user_data: {
    em?: string[]; // SHA-256 hashed emails
    ph?: string[]; // SHA-256 hashed phones
    fn?: string[]; // SHA-256 hashed first names
    ln?: string[]; // SHA-256 hashed last names
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Click ID from _fbc cookie
    fbp?: string; // Browser ID from _fbp cookie
  };
  custom_data?: Record<string, any>;
}

function sha256(value: string): string {
  if (!value) return "";
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function extractFbcFbp(headers: Headers): { fbc?: string; fbp?: string } {
  const cookieHeader = headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  return {
    fbc: cookies["_fbc"] || undefined,
    fbp: cookies["_fbp"] || undefined,
  };
}

export async function sendCapiEvent(
  event: CapiEventData,
  requestHeaders?: Headers
) {
  try {
    const payload: any = {
      data: [event],
      access_token: ACCESS_TOKEN,
    };

    const res = await fetch(CAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("CAPI error:", data.error || data);
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("CAPI send error:", err);
    return { success: false, error: err };
  }
}

export async function sendCapiLead(args: {
  email?: string;
  phone?: string;
  name?: string;
  eventSourceUrl?: string;
  requestHeaders?: Headers;
  customData?: Record<string, any>;
}) {
  const { email, phone, name, eventSourceUrl, requestHeaders, customData } = args;
  const { fbc, fbp } = requestHeaders ? extractFbcFbp(requestHeaders) : {};

  const userData: CapiEventData["user_data"] = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts[1]) userData.ln = [sha256(parts[1])];
  }
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  return sendCapiEvent(
    {
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: customData,
    },
    requestHeaders
  );
}

export async function sendCapiCompleteRegistration(args: {
  email?: string;
  phone?: string;
  name?: string;
  eventSourceUrl?: string;
  requestHeaders?: Headers;
  customData?: Record<string, any>;
}) {
  const { email, phone, name, eventSourceUrl, requestHeaders, customData } = args;
  const { fbc, fbp } = requestHeaders ? extractFbcFbp(requestHeaders) : {};

  const userData: CapiEventData["user_data"] = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts[1]) userData.ln = [sha256(parts[1])];
  }
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  return sendCapiEvent(
    {
      event_name: "CompleteRegistration",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: customData,
    },
    requestHeaders
  );
}

export async function sendCapiPurchase(args: {
  email?: string;
  phone?: string;
  name?: string;
  value: number;
  currency?: string;
  orderId?: string;
  eventSourceUrl?: string;
  requestHeaders?: Headers;
}) {
  const { email, phone, name, value, currency = "INR", orderId, eventSourceUrl, requestHeaders } = args;
  const { fbc, fbp } = requestHeaders ? extractFbcFbp(requestHeaders) : {};

  const userData: CapiEventData["user_data"] = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts[1]) userData.ln = [sha256(parts[1])];
  }
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  // Send Purchase event
  const purchaseResult = await sendCapiEvent(
    {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: {
        value,
        currency,
        order_id: orderId,
        content_type: "product",
        content_name: "Expert Audit — ₹999",
      },
    },
    requestHeaders
  );

  // Also send Lead event since user explicitly wants purchases tracked as leads
  const leadResult = await sendCapiEvent(
    {
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: {
        value,
        currency,
        lead_type: "paid_expert_audit",
        order_id: orderId,
      },
    },
    requestHeaders
  );

  return { purchaseResult, leadResult };
}

export async function sendCapiViewContent(args: {
  email?: string;
  phone?: string;
  name?: string;
  contentName?: string;
  contentType?: string;
  eventSourceUrl?: string;
  requestHeaders?: Headers;
}) {
  const { email, phone, name, contentName, contentType = "product", eventSourceUrl, requestHeaders } = args;
  const { fbc, fbp } = requestHeaders ? extractFbcFbp(requestHeaders) : {};

  const userData: CapiEventData["user_data"] = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts[0]) userData.fn = [sha256(parts[0])];
    if (parts[1]) userData.ln = [sha256(parts[1])];
  }
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  return sendCapiEvent(
    {
      event_name: "ViewContent",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: {
        content_name: contentName,
        content_type: contentType,
      },
    },
    requestHeaders
  );
}
