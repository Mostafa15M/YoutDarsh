const API_KEY = 'AIzaSyDHlSDtApX-B1D3p-JCkKf_PiCMEQKCwzY';

async function handleDarshDownload() {
    const inputUrl = document.getElementById('url').value.trim();
    const btn = document.getElementById('download-btn');
    const ytInfo = document.getElementById('yt-info');

    if(!inputUrl) return alert("ادخل الرابط يا وحش🗝️");

    // فحص الرابط: هل هو يوتيوب؟
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const isYouTube = ytRegex.test(inputUrl);

    if (isYouTube) {
        // --- سيناريو يوتيوب (يفتح صفحة الدقة) ---
        btn.disabled = true;
        btn.style.opacity = "0.5";
        
        const videoId = inputUrl.match(ytRegex)[1];
        
        // جلب بيانات الفيديو (الصورة والعنوان)
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
            const ytData = await ytRes.json();
            if (ytData.items && ytData.items.length > 0) {
                document.getElementById('yt-thumb').src = ytData.items[0].snippet.thumbnails.high.url;
                document.getElementById('yt-title').innerText = ytData.items[0].snippet.title;
                ytInfo.style.display = 'block';
            }
        } catch (e) { console.log("YT API Error"); }

        // جلب الجودات وعرضها في الصفحة التانية
        try {
            const response = await fetch(`https://api.vkrdownloader.com/server?v=${encodeURIComponent(inputUrl)}`);
            const result = await response.json();
            if (result.status === "success" && result.data.downloads) {
                renderQualities(result.data.downloads);
            } else {
                window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
            }
        } catch (error) {
            window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
        }
    } else {
        // --- سيناريو باقي المواقع (تحويل مباشر للموقع القديم) ---
        // استبدل الرابط ده برابط الموقع القديم اللي كنت شغال بيه لو مختلف
        window.location.href = `https://9xbuddy.com/process?url=${encodeURIComponent(inputUrl)}`;
    }
}

function renderQualities(downloads) {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('qualities-page').style.display = 'flex';
    const lv = document.getElementById('list-v'); 
    lv.innerHTML = '';

    downloads.forEach(item => {
        // عرض روابط الـ MP4 اللي فيها صوت وصورة
        if (item.type.includes("video") || item.extension === "mp4") {
            lv.innerHTML += `
            <div class="quality-item" onclick="window.open('${item.url}', '_blank')">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:900; color:#00f2ff">${item.quality}</span>
                    <span style="font-size:11px; color:#94a3b8;">كامل صوت وصورة ✅</span>
                </div>
                <i class="fas fa-download" style="color:#00f2ff"></i>
            </div>`;
        }
    });
}
