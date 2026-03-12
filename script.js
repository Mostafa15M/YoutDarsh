const API_KEY = 'AIzaSyDHlSDtApX-B1D3p-JCkKf_PiCMEQKCwzY';

async function handleDarshDownload() {
    const inputUrl = document.getElementById('url').value.trim();
    const btn = document.getElementById('download-btn');
    const ytInfo = document.getElementById('yt-info');

    if(!inputUrl) return alert("ادخل الرابط يا وحش🗝️");

    // فحص صارم: هل الرابط يوتيوب؟
    const isYouTube = inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be");

    if (isYouTube) {
        // --- يوتيوب: ممنوع التحويل الخارجي ---
        btn.disabled = true;
        btn.innerHTML = "جاري المعالجة...";
        ytInfo.style.display = 'block';

        // 1. جلب بيانات الفيديو من الـ API بتاعك
        const videoId = inputUrl.includes("youtu.be") ? inputUrl.split("/").pop().split("?")[0] : new URLSearchParams(new URL(inputUrl).search).get("v");
        
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
            const ytData = await ytRes.json();
            if (ytData.items && ytData.items.length > 0) {
                document.getElementById('yt-thumb').src = ytData.items[0].snippet.thumbnails.high.url;
                document.getElementById('yt-title').innerText = ytData.items[0].snippet.title;
            }
        } catch (e) { console.log("YT API Error"); }

        // 2. جلب الجودات وعرضها في الصفحة التانية
        try {
            const response = await fetch(`https://api.vkrdownloader.com/server?v=${encodeURIComponent(inputUrl)}`);
            const result = await response.json();
            if (result.status === "success" && result.data.downloads) {
                renderQualities(result.data.downloads);
            } else {
                alert("عذراً، لم نتمكن من جلب الجودات حالياً.");
                btn.disabled = false;
                btn.innerHTML = "تحميل ⬇";
            }
        } catch (error) {
            alert("خطأ في الاتصال بالسيرفر.");
            btn.disabled = false;
        }

    } else {
        // --- أي موقع تاني: حوله فوراً للموقع القديم ---
        window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
    }
}

function renderQualities(downloads) {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('qualities-page').style.display = 'flex';
    const lv = document.getElementById('list-v'); 
    lv.innerHTML = '';

    downloads.forEach(item => {
        // تصفية الجودات اللي فيها فيديو (MP4)
        if (item.type.includes("video") || item.extension === "mp4") {
            lv.innerHTML += `
            <div class="quality-item" onclick="window.open('${item.url}', '_blank')">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:900; color:#00f2ff">${item.quality}</span>
                    <span style="font-size:11px; color:#94a3b8;">Full Video + Audio ✅</span>
                </div>
                <i class="fas fa-download" style="color:#00f2ff"></i>
            </div>`;
        }
    });
}
