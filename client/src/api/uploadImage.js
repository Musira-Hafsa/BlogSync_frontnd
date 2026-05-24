const BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api` 
  : "http://localhost:5000/api";

/**
 * Upload a File object to Cloudinary via the backend.
 * @param {File}   file              — from <input type="file">
 * @param {"cover"|"avatar"} type   — which Cloudinary folder/transform to use
 * @param {(pct: number) => void} [onProgress]  — optional 0–100 callback
 * @returns {Promise<string>} Cloudinary secure URL
 */
export async function uploadImage(file, type = "cover", onProgress) {
  const token =
    localStorage.getItem("bs_token") ||
    sessionStorage.getItem("bs_token");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd  = new FormData();
    fd.append(type, file);

    xhr.open("POST", `${BASE}/upload/${type}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.url);
      } else {
        let msg = "Upload failed";
        try { msg = JSON.parse(xhr.responseText).message || msg; } catch {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(fd);
  });
}

/**
 * Append Cloudinary URL transformation params inline — no extra API call.
 * e.g. cloudinaryUrl(url, "w_800,f_auto,q_auto")
 *
 * @param {string} url   — original Cloudinary URL
 * @param {string} opts  — transformation string
 * @returns {string}     — transformed URL
 */
export function cloudinaryUrl(url, opts = "f_auto,q_auto") {
  if (!url?.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/${opts}/`);
}
