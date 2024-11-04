import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";

const isDev = process.env.NODE_ENV === "development";

function createSerial() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let serial = "";

    for (let i = 0; i < 16; i++) {
        serial += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return serial;
}

export async function GET(request: NextRequest) {
    if (!request.ip && !isDev) {
        return NextResponse.json({
            status: 400,
            error: "bad request (ip not found), please contact support (https://discord.gg/Q6gHakV36z)"
        })
    }

    const request_ip = request.ip || "127.0.0.1";
    const order_id = request.nextUrl.searchParams.get("order_id");
    const order_email = request.nextUrl.searchParams.get("email");

    if (!order_id || !order_email) {
        return NextResponse.json({
            status: 400,
            error: "bad request, please contact support (https://discord.gg/Q6gHakV36z)"
        })
    }

    const response = await fetch("https://sell.app/api/v2/invoices/" + order_id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + process.env.SELLAPP_API_KEY,
        },
    })

    if (!response.ok) {
        return NextResponse.json({
            status: 500,
            error: "internal server error, please contact support (https://discord.gg/Q6gHakV36z)"
        })
    }

    const invoice = await response.json();
    const invoiceData = invoice.data;
    if (invoiceData.customer_information.email !== order_email || invoiceData.status.status.status !== "COMPLETED" || (!isDev && invoiceData.customer_information.ip !== request_ip)) {
        return NextResponse.json({
            status: 400,
            error: "bad request (data mismatch), please contact support (https://discord.gg/Q6gHakV36z)"
        })
    }

    await sql`CREATE TABLE IF NOT EXISTS mspaint_keys ( serial TEXT PRIMARY KEY, order_id TEXT NOT NULL, claimed BOOL );`
    const { rows } = await sql`SELECT * FROM mspaint_keys WHERE order_id = ${order_id};`

    if (rows.length > 0) {
        return NextResponse.json({
            status: 400,
            error: "bad request (order_id already claimed), please contact support (https://discord.gg/Q6gHakV36z)"
        })
    }

    const serial = createSerial();
    await sql`INSERT INTO mspaint_keys (serial, order_id, claimed) VALUES (${serial}, ${order_id}, false);`

    return redirect("/purchase/completed?serial=" + serial);
}