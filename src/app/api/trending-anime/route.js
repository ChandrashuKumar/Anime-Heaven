import { NextResponse } from 'next/server';

export async function GET() {
  const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

  if (!MAL_CLIENT_ID) {
    return NextResponse.json(
      { error: 'MAL_CLIENT_ID is not set in environment variables' },
      { status: 500 }
    );
  }

  // Get the current date, year, and month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // Note: January is 0, February is 1, etc.

  // Determine the season based on the month:
  // winter: January, February, March (0-2)
  // spring: April, May, June (3-5)
  // summer: July, August, September (6-8)
  // fall: October, November, December (9-11)
  let season = '';
  if (month >= 0 && month <= 2) {
    season = 'winter';
  } else if (month >= 3 && month <= 5) {
    season = 'spring';
  } else if (month >= 6 && month <= 8) {
    season = 'summer';
  } else {
    season = 'fall';
  }

  const url = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?limit=100`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
