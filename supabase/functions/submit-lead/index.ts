import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LeadPayload {
  moveType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentAddress: string;
  destinationAddress: string;
  moveDate: string;
  homeSize: string;
  additionalNotes: string;
}

function parseLocation(address: string): {
  city: string;
  state: string;
  zip: string;
} {
  const zipMatch = address.match(/\b(\d{5})\b/);
  const zip = zipMatch ? zipMatch[1] : "";
  const withoutZip = address
    .replace(/\b\d{5}\b/, "")
    .trim()
    .replace(/,?\s*$/, "");
  const parts = withoutZip.split(",").map((s) => s.trim());
  const city = parts[0] || "";
  const state = parts[1] || "";
  return { city, state, zip };
}

function formatDateForAPI(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

function mapServTypeId(moveType: string): string {
  switch (moveType) {
    case "in_state":
      return "101";
    case "out_of_state":
      return "102";
    case "auto_transport":
      return "103";
    case "international":
      return "104";
    default:
      return "102";
  }
}

function mapMoveSize(homeSize: string): string {
  const map: Record<string, string> = {
    studio: "Studio",
    "1_bedroom": "1 Bedroom",
    "2_bedroom": "2 Bedrooms",
    "3_plus_bedroom": "3+ Bedrooms",
  };
  return map[homeSize] || homeSize;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: LeadPayload = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: insertedRow, error: dbError } = await supabase
      .from("moving_requests")
      .insert([
        {
          move_type: payload.moveType,
          first_name: payload.firstName,
          last_name: payload.lastName,
          name: `${payload.firstName} ${payload.lastName}`,
          email: payload.email,
          phone: payload.phone,
          current_address: payload.currentAddress,
          destination_address: payload.destinationAddress,
          move_date: payload.moveDate || null,
          home_size: payload.homeSize,
          additional_notes: payload.additionalNotes,
          hellomoving_status: "pending",
          hellomoving_response: "",
        },
      ])
      .select("id")
      .maybeSingle();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    const rowId = insertedRow?.id;

    let helloMovingSuccess = false;
    let helloMovingError = "";
    let helloMovingResponseBody = "";
    let fullUrl = "";

    try {
      const origin = parseLocation(payload.currentAddress);
      const destination = parseLocation(payload.destinationAddress);
      const servtypeid = mapServTypeId(payload.moveType);
      const phoneDigits = payload.phone.replace(/\D/g, "");

      const apiId = Deno.env.get("HELLOMOVING_API_ID_GetMovers");
      const moverRef = Deno.env.get("HELLOMOVING_MOVER_REF");

      if (!apiId || !moverRef) {
        throw new Error("Missing HELLOMOVING_API_ID or HELLOMOVING_MOVER_REF environment variables");
      }

      // Per the API spec: API_ID and MOVERREF go on the URL (GET params),
      // all lead fields go in the POST body.
      fullUrl = `https://lead.hellomoving.com/LEADSGWHTTP.lidgw?API_ID=${encodeURIComponent(apiId)}&MOVERREF=${encodeURIComponent(moverRef)}`;

      const params = new URLSearchParams({
        servtypeid,
        firstname: payload.firstName,
        lastname: payload.lastName,
        email: payload.email,
        phone1: phoneDigits,
        ocity: origin.city,
        ostate: origin.state,
        dcity: destination.city,
        dstate: destination.state,
        movedte: formatDateForAPI(payload.moveDate),
        movesize: mapMoveSize(payload.homeSize),
        consent: "1",
        label: "SKYBOX2",
      });

      if (origin.zip) params.set("ozip", origin.zip);
      if (destination.zip) params.set("dzip", destination.zip);
      if (payload.additionalNotes) params.set("notes", payload.additionalNotes);
      if (rowId) params.set("leadno", String(rowId));

      console.log("HelloMoving POST params:", params.toString());

      const helloRes = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      helloMovingResponseBody = await helloRes.text();
      console.log("HelloMoving HTTP status:", helloRes.status);
      console.log("HelloMoving response body:", helloMovingResponseBody);

      if (!helloRes.ok) {
        helloMovingError = `HTTP ${helloRes.status}: ${helloMovingResponseBody}`;
      } else {
        // HTTP response format: LEADID,ERRID,MSG,SOLD,MATCH
        // ERRID 0 = OK, anything else is an error
        const parts = helloMovingResponseBody.trim().split(",");
        const errId = parts.length >= 2 ? parts[1].trim() : "";
        const errMsg = parts.length >= 3 ? parts[2].trim() : "";
        if (errId === "0") {
          helloMovingSuccess = true;
        } else {
          helloMovingError = `API Error ${errId}: ${errMsg}`;
        }
      }
    } catch (apiErr) {
      helloMovingError =
        apiErr instanceof Error ? apiErr.message : "Unknown error";
      helloMovingResponseBody = `EXCEPTION: ${helloMovingError}`;
      console.error("HelloMoving API error:", apiErr);
    }

    if (rowId) {
      const statusUpdate = helloMovingSuccess ? "sent" : "failed";
      const responseLog = helloMovingResponseBody
        ? `[${new Date().toISOString()}] Status: ${helloMovingSuccess ? "OK" : "FAIL"} | Response: ${helloMovingResponseBody}`
        : "";

      await supabase
        .from("moving_requests")
        .update({
          hellomoving_status: statusUpdate,
          hellomoving_response: responseLog,
        })
        .eq("id", rowId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        helloMovingSent: helloMovingSuccess,
        helloMovingError: helloMovingError || undefined,
        helloMovingResponse: helloMovingResponseBody || undefined,
        dbSaved: !dbError,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
