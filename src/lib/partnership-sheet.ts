import "server-only";
import { google, type sheets_v4 } from "googleapis";

/** Tab inside the spreadsheet that receives partnership requests. */
export const PARTNERSHIP_SHEET_TAB = "blogs-partnership";

export const PARTNERSHIP_HEADERS = [
  "Timestamp (IST)",
  "Name",
  "Email",
  "Company",
  "Website",
  "Services",
  "Target URL(s)",
  "Details",
  "Source",
] as const;

// Service-account credentials are the same ones the main site uses.
function getSheetsClient(): sheets_v4.Sheets {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const projectId = process.env.GOOGLE_PROJECT_ID;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    .replace(/^"|"$/g, "")
    .trim();

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error(
      "Google Sheets credentials missing: set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_PROJECT_ID.",
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      client_email: clientEmail,
      private_key: privateKey,
      project_id: projectId,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Remembered per server instance so the tab check runs once, not per request.
let tabReady = false;

/** Creates the tab with a header row if it does not exist yet. */
async function ensureTab(sheets: sheets_v4.Sheets, spreadsheetId: string, tab: string) {
  if (tabReady) return;

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === tab);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tab}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...PARTNERSHIP_HEADERS]] },
    });
  }
  tabReady = true;
}

export async function appendPartnershipRow(row: string[]): Promise<void> {
  const spreadsheetId = process.env.PARTNERSHIP_SHEET_ID;
  const tab = PARTNERSHIP_SHEET_TAB;
  if (!spreadsheetId) throw new Error("PARTNERSHIP_SHEET_ID is not set.");

  const sheets = getSheetsClient();
  await ensureTab(sheets, spreadsheetId, tab);

  // RAW so a value starting with "=" or "+" is stored as text, never a formula.
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tab}'!A:I`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}
