import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { imageData, format = 'png', decorations = [], theme = 'modern' } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Decode base64
    const buffer = Buffer.from(imageData, 'base64');
    let sharpInstance = sharp(buffer);

    // Get metadata
    const metadata = await sharpInstance.metadata();

    // Apply theme filters (for downloaded version)
    switch (theme) {
      case 'neon':
        sharpInstance = sharpInstance.modulate({ brightness: 1.1, saturation: 1.3 });
        break;
      case 'dark':
        sharpInstance = sharpInstance.modulate({ brightness: 0.8, saturation: 0.7 });
        break;
      case 'retro':
        sharpInstance = sharpInstance.sepia().modulate({ saturation: 0.7, brightness: 0.9 });
        break;
      case 'glass':
        sharpInstance = sharpInstance.blur(0.5).modulate({ brightness: 1.05 });
        break;
      case 'minimal':
        sharpInstance = sharpInstance.grayscale().modulate({ brightness: 1.05 });
        break;
    }

    // Apply decorations (for downloaded version)
    if (decorations.includes('polaroid')) {
      // Add polaroid style white border
      const padding = 30;
      const extendedWidth = metadata.width + padding * 2;
      const extendedHeight = metadata.height + padding * 3;
      
      const polaroidBuffer = await sharp({
        create: {
          width: extendedWidth,
          height: extendedHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{
        input: await sharpInstance.toBuffer(),
        top: padding,
        left: padding,
      }])
      .png()
      .toBuffer();
      
      sharpInstance = sharp(polaroidBuffer);
    }

    // Convert to requested format
    let outputBuffer;
    let contentType;

    switch (format.toLowerCase()) {
      case 'png':
        outputBuffer = await sharpInstance.png({ quality: 90 }).toBuffer();
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        outputBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
        contentType = 'image/jpeg';
        break;
      case 'webp':
        outputBuffer = await sharpInstance.webp({ quality: 90 }).toBuffer();
        contentType = 'image/webp';
        break;
      default:
        outputBuffer = await sharpInstance.png().toBuffer();
        contentType = 'image/png';
    }

    // Return file
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="webshot-${Date.now()}.${format}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    );
  }
}
