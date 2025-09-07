import React, { useEffect, useRef, useState } from "react";

// ===== Ganti dengan URL Apps Script kamu =====
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbynSFafQEZ9IR4fXVmfBuUCdd1tbLyT6wn_GMRPhq8gxu1abuMc_H3v9ay_paAn3Gim/exec";

export default function FormulirPengambilan() {
  const [formData, setFormData] = useState({
    nomorPerkara: "",
    namaPihak: "",
    nikKtp: "",
    alamat: "",
    tanggalPermohonan: "",
    tempatPengambilan: "",
    tanggalPengambilan: "",
    waktuPengambilan: "",
    namaKuasa: "",
    alamatKuasa: "",
    hubunganKuasa: "",
    noHp: "",
    fotoVerifikasi: null,
    fotoKtp: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ====== Kamera State ======
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [usingBackCamera, setUsingBackCamera] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============== Helpers ==============
  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    window.clearTimeout((showMessage)._t);
    (showMessage)._t = window.setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Stop kamera saat komponen unmount
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============== Kamera Logic ==============
  const hasBackCamera = () => {
    // iOS Safari terkadang mengabaikan 'environment' di insecure context
    return true; // kita coba dulu, kalau gagal kita fallback ke front
  };

  const startCamera = async (photoType) => {
    try {
      setCurrentPhotoType(photoType);
      setIsVideoReady(false);

      // Selfie pakai front, KTP pakai back (environment) jika ada
      const preferBack = photoType === "fotoKtp" && hasBackCamera();
      const constraints = {
        video: {
          facingMode: preferBack ? { ideal: "environment" } : { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setUsingBackCamera(preferBack);
      setCameraStream(stream);
      setShowCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // beberapa browser butuh play() manual
        await videoRef.current.play().catch(() => {});
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      showMessage(
        "Tidak dapat mengakses kamera. Pastikan izin sudah diberikan & halaman menggunakan HTTPS.",
        "error"
      );
    }
  };

  const stopCamera = () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    } catch (_) {}
    setCameraStream(null);
    setShowCamera(false);
    setIsVideoReady(false);
    setCurrentPhotoType("");
  };

  const onVideoReady = () => {
    // Dipanggil oleh onLoadedMetadata/onCanPlay
    setIsVideoReady(true);
  };

  // Utility: resize + compress supaya ukuran tidak terlalu besar
  const drawToCanvas = (video, canvas, maxW = 1280, maxH = 1280) => {
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // pertahankan aspect ratio, batas maksimum dimensi
    let tw = vw;
    let th = vh;
    if (vw > maxW || vh > maxH) {
      const k = Math.min(maxW / vw, maxH / vh);
      tw = Math.round(vw * k);
      th = Math.round(vh * k);
    }

    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");

    // Untuk selfie (front camera), banyak device sudah mirror di UI,
    // tapi frame yang di-draw ke canvas tidak mirror. Kita mirror manual agar sesuai pratinjau.
    const isSelfie = currentPhotoType === "fotoVerifikasi" && !usingBackCamera;
    if (isSelfie) {
      ctx.save();
      ctx.translate(tw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, tw, th);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, tw, th);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      showMessage("Kamera belum siap, tunggu sebentar", "error");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    try {
      drawToCanvas(video, canvas, 1280, 1280);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            showMessage("Gagal mengambil foto, coba lagi", "error");
            return;
          }
          const sizeKB = Math.round(blob.size / 1024);
          if (sizeKB > 2000) {
            // > 2 MB – kecilkan kualitas lagi sekali
            const tmpUrl = canvas.toDataURL("image/jpeg", 0.8);
            setFormData((prev) => ({
              ...prev,
              [currentPhotoType]: {
                data: tmpUrl,
                timestamp: new Date().toISOString(),
                filename: `${currentPhotoType}_${Date.now()}.jpg`,
                size: tmpUrl.length,
              },
            }));
          } else {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64String = e.target?.result;
              setFormData((prev) => ({
                ...prev,
                [currentPhotoType]: {
                  data: base64String,
                  timestamp: new Date().toISOString(),
                  filename: `${currentPhotoType}_${Date.now()}.jpg`,
                  size: blob.size,
                },
              }));
            };
            reader.onerror = () => showMessage("Gagal memproses foto", "error");
            reader.readAsDataURL(blob);
          }
          stopCamera();
          showMessage(
            `📸 Foto ${
              currentPhotoType === "fotoVerifikasi" ? "verifikasi" : "KTP"
            } berhasil diambil!`,
            "success"
          );
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("Error capturing photo:", error);
      showMessage("Terjadi error saat mengambil foto", "error");
    }
  };

  // ====== Upload dari file (fallback jika kamera bermasalah) ======
  const onPickFile = (photoType) => {
    setCurrentPhotoType(photoType);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      showMessage("File harus berupa gambar", "error");
      return;
    }
    // Baca ke dataURL & optional resize via offscreen canvas untuk jaga ukuran
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      // resize jika terlalu besar
      const maxW = 1600;
      const maxH = 1600;
      let w = img.width;
      let h = img.height;
      if (w > maxW || h > maxH) {
        const k = Math.min(maxW / w, maxH / h);
        w = Math.round(w * k);
        h = Math.round(h * k);
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setFormData((prev) => ({
        ...prev,
        [currentPhotoType]: {
          data: dataUrl,
          timestamp: new Date().toISOString(),
          filename: `${currentPhotoType}_${Date.now()}.jpg`,
          size: dataUrl.length,
        },
      }));
      showMessage(
        `📎 Foto ${
          currentPhotoType === "fotoVerifikasi" ? "verifikasi" : "KTP"
        } diunggah dari file.`,
        "success"
      );
      setCurrentPhotoType("");
      e.target.value = "";
    };
    const fr = new FileReader();
    fr.onload = (ev) => {
      img.src = ev.target?.result;
    };
    fr.readAsDataURL(file);
  };

  // ============== Simpan ==============
  const handleSimpan = async () => {
    if (
      !formData.nomorPerkara ||
      !formData.namaPihak ||
      !formData.nikKtp ||
      !formData.alamat ||
      !formData.noHp
    ) {
      showMessage("Mohon isi semua field yang wajib", "error");
      return;
    }
    if (
      !formData.tanggalPermohonan ||
      !formData.tempatPengambilan ||
      !formData.tanggalPengambilan ||
      !formData.waktuPengambilan
    ) {
      showMessage("Mohon isi tanggal/waktu/tempat pengambilan", "error");
      return;
    }
    if (!formData.fotoVerifikasi) {
      showMessage("Foto verifikasi wajib diambil", "error");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        timestamp: new Date().toISOString(),
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      showMessage("Data berhasil disimpan ke Database! 📊", "success");
      setFormData({
        nomorPerkara: "",
        namaPihak: "",
        nikKtp: "",
        alamat: "",
        tanggalPermohonan: "",
        tempatPengambilan: "",
        tanggalPengambilan: "",
        waktuPengambilan: "",
        namaKuasa: "",
        alamatKuasa: "",
        hubunganKuasa: "",
        noHp: "",
        fotoVerifikasi: null,
        fotoKtp: null,
      });
    } catch (error) {
      console.error("Error:", error);
      showMessage("Terjadi error saat menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKembali = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin kembali? Data yang belum disimpan akan hilang."
      )
    ) {
      stopCamera();
      setFormData({
        nomorPerkara: "",
        namaPihak: "",
        nikKtp: "",
        alamat: "",
        tanggalPermohonan: "",
        tempatPengambilan: "",
        tanggalPengambilan: "",
        waktuPengambilan: "",
        namaKuasa: "",
        alamatKuasa: "",
        hubunganKuasa: "",
        noHp: "",
        fotoVerifikasi: null,
        fotoKtp: null,
      });
      setMessage("");
    }
  };

  const deletePhoto = (photoType) => {
    setFormData((prev) => ({ ...prev, [photoType]: null }));
    showMessage(
      `Foto ${photoType === "fotoVerifikasi" ? "verifikasi" : "KTP"} berhasil dihapus!`,
      "success"
    );
  };

  // ============== UI ==============
  return (
    <div
      className="bg-gray-100 font-sans flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Header */}
      <div className="bg-green-500 text-white py-3 md:py-4 px-4 md:px-5 text-center">
        <h1 className="text-base md:text-lg lg:text-xl font-bold leading-tight">
          Formulir Permohonan Pengambilan Produk Putusan
        </h1>
        <p className="text-xs md:text-sm mt-1 opacity-90">Pengadilan Agama Kalianda</p>
      </div>

      {/* Alert Message */}
      {message && (
        <div className="mx-auto max-w-7xl mt-2 md:mt-4 px-4 md:px-5">
          <div
            className={`p-3 md:p-4 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                📸 Ambil Foto {currentPhotoType === "fotoVerifikasi" ? "Verifikasi" : "KTP"}
              </h3>
              <p className="text-sm text-gray-600">
                {currentPhotoType === "fotoVerifikasi"
                  ? "Ambil foto selfie untuk verifikasi identitas (pastikan wajah jelas)"
                  : "Ambil foto KTP yang jelas & tidak blur"}
              </p>
            </div>

            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                onLoadedMetadata={onVideoReady}
                onCanPlay={onVideoReady}
                className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 bg-black"
              />
              {/* Overlay guide */}
              <div className="absolute inset-0 border-2 border-dashed border-white rounded-lg pointer-events-none">
                <div className="absolute inset-4 border-2 border-white rounded-lg opacity-50"></div>
              </div>
              {!isVideoReady && (
                <div className="absolute inset-0 grid place-items-center text-white text-sm">
                  Mengaktifkan kamera...
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={stopCamera}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                ❌ Batal
              </button>
              <button
                onClick={capturePhoto}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                disabled={!isVideoReady}
              >
                📷 Ambil Foto
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mt-3 text-center">
              Tip: Gunakan lingkungan terang, bersihkan lensa. Pada iPhone/iOS gunakan HTTPS agar kamera belakang dapat diakses.
            </p>
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Main Content */}
      <div
        className="max-w-7xl mx-auto px-4 md:px-5 py-4 md:py-6 bg-white flex-1 overflow-y-auto min-h-0"
        style={{ WebkitOverflowScrolling: "touch", paddingBottom: "calc(env(safe-area-inset-bottom) + 11rem)" }}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10 mb-6 md:mb-8">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-5">
            {/* Nomor Perkara */}
            <div>
              <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                Nomor Perkara <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nomorPerkara"
                value={formData.nomorPerkara}
                onChange={handleInputChange}
                placeholder="Contoh : 123/Pdt.G/2025/PA.Kla"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                required
              />
            </div>

            {/* Nama Pihak */}
            <div>
              <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                Nama Pihak <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaPihak"
                value={formData.namaPihak}
                onChange={handleInputChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                required
              />
            </div>

            {/* NIK KTP */}
            <div>
              <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                NIK KTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nikKtp"
                value={formData.nikKtp}
                onChange={handleInputChange}
                maxLength="16"
                placeholder="16 digit NIK"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                required
              />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                Nomor HP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="noHp"
                value={formData.noHp}
                onChange={handleInputChange}
                maxLength="15"
                placeholder="Contoh: 08xxxxxxxxxx"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                required
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                Alamat <span className="text-red-500">*</span>
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                rows="3"
                placeholder="Alamat lengkap..."
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base resize-y min-h-[80px]"
                required
              />
            </div>

            {/* Photo Verification Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 md:p-6 rounded-xl border border-red-200">
              <h3 className="text-base md:text-lg font-bold text-red-800 mb-4 flex items-center">
                <span className="bg-red-500 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Verifikasi Foto <span className="text-red-500 ml-1">*</span>
              </h3>

              <div className="space-y-4">
                {/* Foto Verifikasi */}
                <div>
                  <label className="block mb-2 font-medium text-sm md:text-base text-gray-700">
                    Foto Verifikasi Identitas <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-3">
                    {formData.fotoVerifikasi ? (
                      <div className="relative">
                        <img
                          src={formData.fotoVerifikasi.data}
                          alt="Foto Verifikasi"
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                        />
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">✅ Foto Tersimpan</div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => deletePhoto("fotoVerifikasi")}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-xs"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => startCamera("fotoVerifikasi")}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full text-xs"
                            title="Ambil Ulang"
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startCamera("fotoVerifikasi")}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          📷 Ambil Selfie
                        </button>
                        <button
                          onClick={() => onPickFile("fotoVerifikasi")}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                        >
                          📎 Unggah File
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 italic">Selfie diperlukan untuk verifikasi identitas pemohon</p>
                </div>

                {/* Foto KTP (Opsional) */}
                <div>
                  <label className="block mb-2 font-medium text-sm md:text-base text-gray-700">Foto KTP (Opsional)</label>
                  <div className="flex flex-col gap-3">
                    {formData.fotoKtp ? (
                      <div className="relative">
                        <img
                          src={formData.fotoKtp.data}
                          alt="Foto KTP"
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                        />
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">✅ Foto Tersimpan</div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => deletePhoto("fotoKtp")}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-xs"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => startCamera("fotoKtp")}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full text-xs"
                            title="Ambil Ulang"
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startCamera("fotoKtp")}
                          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          📄 Ambil Foto KTP
                        </button>
                        <button
                          onClick={() => onPickFile("fotoKtp")}
                          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                        >
                          📎 Unggah File
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 italic">Foto KTP membantu mempercepat verifikasi</p>
                </div>
              </div>
            </div>

            {/* Date/Time Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                  Tanggal Permohonan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalPermohonan"
                  value={formData.tanggalPermohonan}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                  Tempat Pengambilan <span className="text-red-500">*</span>
                </label>
                <select
                  name="tempatPengambilan"
                  value={formData.tempatPengambilan}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                >
                  <option value="">-- Pilih Tempat Pengambilan --</option>
                  <option value="Kantor Pengambilan Agama Kalianda">Kantor Pengambilan Agama Kalianda</option>
                  <option value="Kantor Desa Karang Sari Kecamatan Jati Agung">Kantor Desa Karang Sari Kecamatan Jati Agung</option>
                  <option value="Kantor Desa Jati Baru Kecamatan Tanjung Bintang">Kantor Desa Jati Baru Kecamatan Tanjung Bintang</option>
                  <option value="Kantor Desa Titiwangi Kecamatan Candipuro">Kantor Desa Titi Wangi Kecamatan Candipuro</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                  Tanggal Pengambilan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalPengambilan"
                  value={formData.tanggalPengambilan}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                  Waktu Pengambilan <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="waktuPengambilan"
                  value={formData.waktuPengambilan}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column - Kuasa Section */}
          <div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800">Data Kuasa</h3>
              </div>

              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 italic">
                Isi jika permohonan melalui kuasa hukum
              </p>

              <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                    Nama Kuasa
                  </label>
                  <input
                    type="text"
                    name="namaKuasa"
                    value={formData.namaKuasa}
                    onChange={handleInputChange}
                    placeholder="Nama lengkap kuasa hukum"
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                    Alamat Kuasa
                  </label>
                  <textarea
                    name="alamatKuasa"
                    value={formData.alamatKuasa}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Alamat lengkap kuasa hukum..."
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base resize-y min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base text-gray-700">
                    Hubungan Kuasa
                  </label>
                  <select
                    name="hubunganKuasa"
                    value={formData.hubunganKuasa}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  >
                    <option value="">-- Pilih Hubungan --</option>
                    <option value="Kuasa Hukum">Kuasa Hukum</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Advokat">Advokat</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-2">Informasi Penting</h3>
              <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                Data yang disimpan akan langsung masuk ke database dan dapat dilihat secara real-time oleh admin.
                Foto verifikasi wajib diambil untuk keamanan. Pastikan semua data sudah benar sebelum menyimpan.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 md:gap-5">
          <button
            onClick={handleKembali}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg transition-all shadow-lg text-sm md:text-base order-2 sm:order-1"
          >
            🔄 Kembali
          </button>

          <button
            onClick={handleSimpan}
            disabled={loading}
            className={`w-full sm:w-auto ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            } text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg transition-all shadow-lg text-sm md:text-base order-1 sm:order-2`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Menyimpan...
              </span>
            ) : (
              "📊 Submit Permohonan"
            )}
          </button>
        </div>
      </div>

      {/* Footer (fixed) */}
      <div
        className="bg-gray-900 text-white py-4 md:py-6 px-4 md:px-5 fixed bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-3 md:mb-0">
              <p className="text-sm md:text-base font-semibold">KING LAMBAN DILAN</p>
              <p className="text-xs text-gray-300">© Copyright By Pengadilan Agama Kalianda</p>
            </div>
            <div className="text-xs text-gray-300">
              <div>© 2023</div>
              <div>Version 4.4.0 - Application Integration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
