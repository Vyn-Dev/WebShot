import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      url, 
      shotType, 
      theme, 
      decorations, 
      customSize, 
      delay = 2000, 
      quality = 90 
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Use Chromium for Vercel
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));

    // Set viewport based on shot type
    let viewportConfig = { width: 1920, height: 1080 };
    let fullPage = false;

    switch (shotType) {
      case 'desktop':
        viewportConfig = { width: 1920, height: 1080 };
        fullPage = true;
        break;
      case 'desktop-viewport':
        viewportConfig = { width: 1920, height: 1080 };
        break;
      case 'tablet':
        viewportConfig = { width: 768, height: 1024 };
        break;
      case 'mobile':
        viewportConfig = { width: 375, height: 812 };
        fullPage = true;
        break;
      case 'mobile-viewport':
        viewportConfig = { width: 375, height: 812 };
        break;
      case 'social':
        viewportConfig = { width: 1200, height: 630 };
        break;
      case 'custom':
        if (customSize) {
          viewportConfig = { 
            width: customSize.width || 1920, 
            height: customSize.height || 1080 
          };
        }
        break;
    }

    await page.setViewport(viewportConfig);

    const screenshotBuffer = await page.screenshot({
      encoding: 'buffer',
      fullPage,
      quality: shotType === 'desktop' ? quality : undefined,
    });

    await browser.close();

    // Process image with Sharp
    let processedImage = screenshotBuffer;

    if (decorations && decorations.length > 0) {
      const metadata = await sharp(processedImage).metadata();
      let sharpInstance = sharp(processedImage);

      decorations.forEach((decoration: string) => {
        switch (decoration) {
          case 'gradient':
            const gradientSvg = `
              <svg width="${metadata.width}" height="${metadata.height}">
                <rect width="${metadata.width}" height="${metadata.height}" 
                      stroke="url(#grad)" stroke-width="8" fill="none" rx="12"/>
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#4ECDC4;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#45B7D1;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
            `;
            sharpInstance = sharpInstance.composite([{ 
              input: Buffer.from(gradientSvg), 
              gravity: 'northwest' 
            }]);
            break;
          case 'corner':
            const cornerSvg = `
              <svg width="${metadata.width}" height="${metadata.height}">
                <rect x="10" y="10" width="40" height="40" fill="none" stroke="#8B5CF6" stroke-width="3" rx="4"/>
                <rect x="${metadata.width - 50}" y="10" width="40" height="40" fill="none" stroke="#8B5CF6" stroke-width="3" rx="4"/>
                <rect x="10" y="${metadata.height - 50}" width="40" height="40" fill="none" stroke="#8B5CF6" stroke-width="3" rx="4"/>
                <rect x="${metadata.width - 50}" y="${metadata.height - 50}" width="40" height="40" fill="none" stroke="#8B5CF6" stroke-width="3" rx="4"/>
              </svg>
            `;
            sharpInstance = sharpInstance.composite([{ 
              input: Buffer.from(cornerSvg), 
              gravity: 'northwest' 
            }]);
            break;
          case 'frame':
            const frameSvg = `
              <svg width="${metadata.width}" height="${metadata.height}">
                <rect x="5" y="5" width="${metadata.width - 10}" height="${metadata.height - 10}" 
                      fill="none" stroke="#ffffff" stroke-width="2" rx="8" opacity="0.5"/>
              </svg>
            `;
            sharpInstance = sharpInstance.composite([{ 
              input: Buffer.from(frameSvg), 
              gravity: 'northwest' 
            }]);
            break;
        }
      });

      processedImage = await sharpInstance.png().toBuffer();
    }

    // Apply theme filters
    if (theme && theme !== 'modern') {
      let sharpInstance = sharp(processedImage);
      
      switch (theme) {
        case 'dark':
          sharpInstance = sharpInstance.modulate({ brightness: 0.7, saturation: 0.8 });
          break;
        case 'glass':
          sharpInstance = sharpInstance.blur(1).modulate({ brightness: 1.1 });
          break;
        case 'neon':
          sharpInstance = sharpInstance
            .modulate({ brightness: 1.2, saturation: 1.5 })
            .sharpen(2);
          break;
        case 'retro':
          sharpInstance = sharpInstance
            .sepia()
            .modulate({ saturation: 0.6, brightness: 0.9 });
          break;
        case 'minimal':
          sharpInstance = sharpInstance
            .grayscale()
            .modulate({ brightness: 1.1, saturation: 0.5 });
          break;
      }
      
      processedImage = await sharpInstance.png().toBuffer();
    }

    const base64Image = processedImage.toString('base64');

    return NextResponse.json({
      screenshot: base64Image,
      metadata: {
        width: viewportConfig.width,
        height: viewportConfig.height,
        format: 'png',
        quality,
      },
      decorations,
      theme,
      timestamp: Date.now(),
      id: Date.now(),
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}
