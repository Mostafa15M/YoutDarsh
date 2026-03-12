const GOOGLE_KEY = 'AIzaSyDHlSDtApX-B1D3p-JCkKf_PiCMEQKCwzY';

async function startDownload() {
    const inputField = document.getElementById('url');
    const url = inputField.value.trim();
    const btn = document.getElementById('download-btn');
    const preview = document.getElementById('yt-preview');

    if (!url) return;

    btn.disabled = true;
    btn.innerHTML = "جاري الفحص... 🚀";
    preview.style.display = 'block';

    let vId = "";
    try {
        if (url.includes("v=")) vId = new URLSearchParams(new URL(url).search).get("v");
        else vId = url.split("/").pop().split("?")[0];
    } catch(e) { vId = ""; }

    // طلب صامت لجوجل (معلومات الفيديو)
    if (vId) {
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vId}&key=${GOOGLE_KEY}`)
            .then(res => res.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    document.getElementById('yt-thumb').src = data.items[0].snippet.thumbnails.high.url;
                    document.getElementById('yt-title').innerText = data.items[0].snippet.title;
                }
            }).catch(() => console.log("Google Info Skip"));
    }

    // جلب الروابط باستخدام Proxy لتجنب "خطأ الاتصال"
    try {
        // السيرفر ده بيجيب الجودات مباشرة
        const apiUrl = `https://api.vkrdownloader.com/server?v=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const apiData = await response.json();
        
        if (apiData && apiData.data && apiData.data.downloads) {
            showLinks(apiData.data.downloads);
        } else {
            // محاولة أخيرة لو السيرفر الأول وقع
            window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(url)}`;
        }
    } catch (error) {
        // لو حصل أي خطأ، بدل ما نطلع رسالة Alert، بنحول للموقع المضمون
        window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(url)}`;
    }
}

function showLinks(links) {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('quality-view').style.display = 'block';
    const list = document.getElementById('links-list');
    list.innerHTML = '';

    links.forEach(link => {
        const isVideo = link.extension === "mp4" || link.type.includes("video");
        const isAudio = link.extension === "mp3" || link.type.includes("audio");

        if (isVideo || isAudio) {
            const label = isVideo ? `فيديو - ${link.quality}` : "صوت MP3";
            const color = isVideo ? "#00f2ff" : "#bc13fe";
            const icon = isVideo ? "fa-video" : "fa-music";

            list.innerHTML += `
            <div class="quality-card" style="border-left: 5px solid ${color}; display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:10px; cursor:pointer;" onclick="window.open('${link.url}', '_blank')">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:900; color:${color}">${label}</span>
                    <span style="font-size:11px; color:#94a3b8;">جاهز للتحميل المباشر ✅</span>
                </div>
                <i class="fas ${icon}" style="color:${color}"></i>
            </div>`;
        }
    });
}
