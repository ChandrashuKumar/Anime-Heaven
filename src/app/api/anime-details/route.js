import { NextResponse } from 'next/server';

export async function GET() {
  const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

  if (!MAL_CLIENT_ID) {
    return NextResponse.json(
      { error: 'MAL_CLIENT_ID is not set in environment variables' },
      { status: 500 }
    );
  }

  const url = `https://api.myanimelist.net/v2/anime/30230?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics`;

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
