const API_KEY = "AIzaSyDKVSSRYSJ0NOgXwPoUuxuwDBzezUCVR08";

async function searchSong(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items.length > 0) {
        return `https://www.youtube.com/embed/${data.items[0].id.videoId}?autoplay=1`;
    } else {
        return null;
    }
}

export { searchSong };
