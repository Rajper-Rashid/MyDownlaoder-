// Language Data
const languageStrings = {
  en: {
    placeholder: "Paste your video URL here...",
    button: "Download",
    downloading: "⏳ Downloading... Please wait.",
    success: "✅ Download complete!",
    error: "❌ Error:",
    confirm: "🔸 Watch ad before download? Click OK to continue.",
  },
  ur: {
    placeholder: "اپنی ویڈیو کا لنک یہاں پیسٹ کریں...",
    button: "ڈاؤن لوڈ کریں",
    downloading: "⏳ ڈاؤن لوڈ ہو رہا ہے... براہ کرم انتظار کریں۔",
    success: "✅ ڈاؤن لوڈ مکمل ہو گیا!",
    error: "❌ خرابی:",
    confirm: "🔸 براہ کرم اشتہار دیکھیں، جاری رکھنے کے لیے OK دبائیں۔",
  },
};

let currentLang = "en";

// Toggle Language
function toggleLanguage() {
  currentLang = currentLang === "en" ? "ur" : "en";
  document.getElementById("videoUrl").placeholder =
    languageStrings[currentLang].placeholder;
  document.getElementById("downloadBtn").innerHTML =
    `<i class="fa fa-download"></i> ${languageStrings[currentLang].button}`;
}

// Download Video with Title
function downloadVideo() {
  const url = document.getElementById("videoUrl").value;

  if (!url) {
    alert(languageStrings[currentLang].placeholder);
    return;
  }

  if (!confirm(languageStrings[currentLang].confirm)) {
    console.log("❌ User cancelled download.");
    return;
  }

  document.getElementById("result").innerText =
    languageStrings[currentLang].downloading;

  // Step 1: Fetch video title from backend
  const titleForm = new FormData();
  titleForm.append("url", url);

  fetch("http://127.0.0.1:5000/title", {
    method: "POST",
    body: titleForm,
  })
    .then((res) => res.json())
    .then((data) => {
      const title = data.title || "Unknown Video";

      // Step 2: Show in download list
      const downloadList = document.getElementById("downloadList");
      const li = document.createElement("li");
      li.innerText = `Downloading: ${title} (0%)`;
      downloadList.appendChild(li);

      // Step 3: Download video
      const formData = new FormData();
      formData.append("url", url);

      fetch("http://127.0.0.1:5000/download", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok)
            throw new Error("Download failed or server error.");
          return response.blob();
        })
        .then((blob) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `${title}.mp4`;
          document.body.appendChild(a);
          a.click();
          a.remove();

          document.getElementById("result").innerText =
            languageStrings[currentLang].success;

          li.innerText = `✅ Downloaded: ${title}`;
        })
        .catch((err) => {
          document.getElementById("result").innerText =
            languageStrings[currentLang].error + " " + err.message;
          li.innerText = `❌ Failed: ${title}`;
        });
    })
    .catch((err) => {
      document.getElementById("result").innerText =
        languageStrings[currentLang].error + " " + err.message;
    });
}

// Show Tabs
function showTab(tabId) {
  const tabs = ["home", "downloads", "settings"];
  tabs.forEach((id) => {
    document.getElementById(id).classList.remove("active");
  });
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const btnIndex = tabs.indexOf(tabId);
  document.querySelectorAll(".tab-btn")[btnIndex].classList.add("active");
}

// Swipe Gesture Navigation
let touchStartX = 0;
let touchEndX = 0;

document.querySelector(".container").addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.querySelector(".container").addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const tabs = ["home", "downloads", "settings"];
  const activeTab = document.querySelector(".tab-content.active");
  const currentIndex = parseInt(activeTab.dataset.index);
  const delta = touchEndX - touchStartX;

  if (delta < -50 && currentIndex < tabs.length - 1) {
    showTab(tabs[currentIndex + 1]);
  } else if (delta > 50 && currentIndex > 0) {
    showTab(tabs[currentIndex - 1]);
  }
}