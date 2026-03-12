const YOUTUBE_API_KEY = 'AIzaSyDHlSDtApX-B1D3p-JCkKf_PiCMEQKCwzY';

async function handleDarshDownload() {
    const inputUrl = document.getElementById('url').value.trim();
    const btn = document.getElementById('download-btn');
    const status = document.getElementById('status-msg');
    const ytInfo = document.getElementById('yt-info');

    if(!inputUrl) return alert("ادخل الرابط يا وحش🗝️");

    // إعداد حالة التحميل
    btn.disabled = true;
    btn.style.opacity = "0.5";
    status.style.display = "block";
    ytInfo.style.display = "none";

    // 1. الجزء الخاص بالـ YouTube API الخاص بك (يعمل فقط مع روابط يوتيوب)
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = inputUrl.match(ytRegex);

    if (ytMatch && ytMatch[1]) {
        const videoId = ytMatch[1];
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
            const ytData = await ytRes.json();
            if (ytData.items && ytData.items.length > 0) {
                document.getElementById('yt-thumb').src = ytData.items[0].snippet.thumbnails.high.url;
                document.getElementById('yt-title').innerText = ytData.items[0].snippet.title;
                ytInfo.style.display = 'block';
            }
        } catch (e) { console.log("YT API Error"); }
    }

    // 2. الجزء الخاص بجلب روابط التحميل (لكل المنصات كما كان سابقاً)
    try {
        const response = await fetch(`https://api.vkrdownloader.com/server?v=${encodeURIComponent(inputUrl)}`);
        const result = await response.json();

        if (result.status === "success" && result.data.downloads) {
            renderQualities(result.data.downloads);
        } else {
            // المحرك الاحتياطي
            window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
        }
    } catch (error) {
        window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
    }
}

function renderQualities(downloads) {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('qualities-page').style.display = 'flex';
    
    const lv = document.getElementById('list-v'); 
    lv.innerHTML = '';

    downloads.forEach(item => {
        // فلترة لعرض روابط الفيديو فقط
        if (item.type.includes("video") || item.extension === "mp4") {
            lv.innerHTML += `
            <div class="quality-item" onclick="window.open('${item.url}', '_blank')">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:900; color:var(--neon-blue)">${item.quality}</span>
                    <span style="font-size:11px; color:#94a3b8;">صوت + صورة ✅ (${item.extension})</span>
                </div>
                <i class="fas fa-download" style="color:var(--neon-blue)"></i>
            </div>`;
        }
    });

    if (lv.innerHTML === '') {
        const inputUrl = document.getElementById('url').value.trim();
        window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
    }
}
