import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Render di Edge/Serverless dengan durasi maksimal 10 detik (Batas Vercel Hobby)
export const maxDuration = 10; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL wajib dimasukkan" }, { status: 400 });
  }

  let targetUrl = url;
  if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

  try {
    const executablePath = await chromium.executablePath();
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: executablePath || undefined,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Timeout diset 8000ms agar tidak error timeout di Vercel
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 8000 });
    
    const screenshot = await page.screenshot({ type: "png" });
    await browser.close();

    const headers = new Headers();
    headers.set("Content-Type", "image/png");
    headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate");
    
    return new NextResponse(screenshot, { status: 200, headers });
    
  } catch (error: any) {
    console.error("Screenshot error:", error);
    return NextResponse.json({ error: "Gagal mengambil screenshot atau web terlalu berat" }, { status: 500 });
  }
}
