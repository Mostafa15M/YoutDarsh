const GOOGLE_KEY = 'AIzaSyDHlSDtApX-B1D3p-JCkKf_PiCMEQKCwzY';

async function startDownload() {
    const urlInput = document.getElementById('url');
    const url = urlInput.value.trim();
    const btn = document.getElementById('download-btn');
    const preview = document.getElementById('yt-preview');

    if (!url) return alert("يا درش فين الرابط؟ 🗝️");

    // فحص ذكي للروابط (يوتيوب أو غيره)
    const isYT = url.toLowerCase().includes("youtube") || url.toLowerCase().includes("youtu.be") || url.includes("googleusercontent.com/youtube");

    if (isYT) {
        btn.disabled = true;
        btn.innerHTML = "جاري التحضير... 🚀";
        preview.style.display = 'block';

        let vId = "";
        try {
            if (url.includes("v=")) vId = new URLSearchParams(new URL(url).search).get("v");
            else if (url.includes("youtu.be/")) vId = url.split("youtu.be/")[1].split(/[?&]/)[0];
            else vId = url.split("/").pop().split("?")[0];
        } catch(e) { vId = ""; }

        // تشغيل طلبين في نفس الوقت للسرعة القصوى
        const googleReq = vId ? fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vId}&key=${GOOGLE_KEY}`).then(r => r.json()).catch(() => null) : Promise.resolve(null);
        const dlReq = fetch(`https://api.vkrdownloader.com/server?v=${encodeURIComponent(url)}`).then(r => r.json()).catch(() => null);

        const [ytData, apiData] = await Promise.all([googleReq, dlReq]);

        // عرض بيانات الفيديو (لو جوجل سمح بالدخول)
        if (ytData && ytData.items && ytData.items.length > 0) {
            document.getElementById('yt-thumb').src = ytData.items[0].snippet.thumbnails.high.url;
            document.getElementById('yt-title').innerText = ytData.items[0].snippet.title;
        }

        // عرض الروابط للمستخدم
        if (apiData && apiData.status === "success" && apiData.data.downloads) {
            showLinks(apiData.data.downloads);
        } else {
            alert("السيرفر مشغول حالياً، جرب كمان دقيقة يا بطل.");
            btn.disabled = false;
            btn.innerHTML = "تحميل الآن ⬇";
        }
    } else {
        // أي موقع تاني تحويل فوري للمحرك القديم
        window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(url)}`;
    }
}

function showLinks(links) {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('quality-view').style.display = 'block';
    const list = document.getElementById('links-list');
    list.innerHTML = '';

    links.forEach(link => {
        // تصفية الروابط للفيديو والصوت فقط
        const isVideo = link.extension === "mp4" || link.type.includes("video");
        const isAudio = link.extension === "mp3" || link.type.includes("audio");

        if (isVideo || isAudio) {
            const icon = isVideo ? "fa-video" : "fa-music";
            const color = isVideo ? "#00f2ff" : "#bc13fe";
            const label = isVideo ? `جودة ${link.quality}` : "ملف صوتي MP3";

            list.innerHTML += `
            <div class="quality-card" style="border-left: 5px solid ${color}" onclick="window.open('${link.url}', '_blank')">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:900; color:${color}">${label}</span>
                    <span style="font-size:11px; color:#94a3b8;">اضغط للتحميل المباشر ✅</span>
                </div>
                <i class="fas ${icon}" style="color:${color}; font-size:20px;"></i>
            </div>`;
        }
    });
}
