import React, { useState, useRef, useEffect } from 'react';

// Ganti dengan URL Apps Script untuk EAC
const GOOGLE_SCRIPT_EAC_URL = 'https://script.google.com/macros/s/AKfycbw7oUjP7WV5DIYMGGBBpoqo4xyIZkcA8K4EJg0tz8vG6891GTFrLTUJyDeKVSqZv26D/exec';

function FormulirEAC() {
  const [formData, setFormData] = useState({
    noPerkara: '',
    namaPihak: '',
    nik: '',
    email: '',
    noHp: '',
    fotoVerifikasi: null,
    fotoKtp: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'nik') {
      const numericValue = value.replace(/\D/g, '').slice(0, 16);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name === 'noHp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 15);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // Fungsi untuk memulai kamera
  const startCamera = async (photoType) => {
    try {
      setCurrentPhotoType(photoType);
      setShowCamera(true);
      setIsVideoReady(false);
      
      const constraints = {
        video: {
          facingMode: photoType === 'fotoVerifikasi' ? 'user' : 'environment',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsVideoReady(true);
            })
            .catch(err => {
              console.error('Play failed:', err);
              showMessage('Gagal memulai video kamera', 'error');
            });
        };
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setShowCamera(false);
      let errorMessage = 'Tidak dapat mengakses kamera. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Izin kamera ditolak. Silakan berikan izin dan coba lagi.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Kamera tidak ditemukan.';
      } else {
        errorMessage += 'Pastikan kamera tersedia dan browser mendukung.';
      }
      showMessage(errorMessage, 'error');
    }
  };

  // Fungsi untuk menghentikan kamera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCurrentPhotoType('');
    setIsVideoReady(false);
  };

  // Fungsi untuk mengambil foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      showMessage('Kamera belum siap, tunggu sebentar', 'error');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    try {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64String = e.target.result;
            setFormData(prev => ({
              ...prev,
              [currentPhotoType]: {
                data: base64String,
                timestamp: new Date().toISOString(),
                filename: `${currentPhotoType}_${Date.now()}.jpg`,
                size: blob.size
              }
            }));
            
            stopCamera();
            showMessage(`📸 Foto ${currentPhotoType === 'fotoVerifikasi' ? 'verifikasi' : 'KTP'} berhasil diambil!`, 'success');
          };
          reader.onerror = () => {
            showMessage('Gagal memproses foto, coba lagi', 'error');
          };
          reader.readAsDataURL(blob);
        } else {
          showMessage('Gagal mengambil foto, coba lagi', 'error');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error capturing photo:', error);
      showMessage('Terjadi error saat mengambil foto', 'error');
    }
  };

  // Fungsi untuk menghapus foto
  const deletePhoto = (photoType) => {
    setFormData(prev => ({
      ...prev,
      [photoType]: null
    }));
    showMessage(`Foto ${photoType === 'fotoVerifikasi' ? 'verifikasi' : 'KTP'} berhasil dihapus!`, 'success');
  };

  // Fungsi untuk upload file (fallback untuk foto KTP)
  const onPickFile = (photoType) => {
    setCurrentPhotoType(photoType);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!/^image\//i.test(file.type)) {
      showMessage('File harus berupa gambar', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('Ukuran file maksimal 5MB', 'error');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      setFormData(prev => ({
        ...prev,
        [currentPhotoType]: {
          data: dataUrl,
          timestamp: new Date().toISOString(),
          filename: `${currentPhotoType}_${Date.now()}.jpg`,
          size: dataUrl.length,
        },
      }));
      
      showMessage(
        `Foto ${currentPhotoType === 'fotoVerifikasi' ? 'verifikasi' : 'KTP'} berhasil diunggah!`,
        'success'
      );
      setCurrentPhotoType('');
      e.target.value = '';
    };
    
    img.onerror = () => {
      showMessage('Gagal memuat gambar', 'error');
    };
    
    const fr = new FileReader();
    fr.onload = (ev) => (img.src = ev.target?.result);
    fr.readAsDataURL(file);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!formData.noPerkara.trim()) return showMessage('No Perkara harus diisi', 'error');
    if (!formData.namaPihak.trim()) return showMessage('Nama Pihak harus diisi', 'error');
    if (!formData.nik.trim() || formData.nik.length !== 16) return showMessage('NIK harus 16 digit', 'error');
    if (!formData.email.trim()) return showMessage('Email harus diisi', 'error');
    if (!validateEmail(formData.email)) return showMessage('Format email tidak valid', 'error');
    if (!formData.noHp.trim() || formData.noHp.length < 10) return showMessage('No HP minimal 10 digit', 'error');
    
    // Validasi foto verifikasi wajib
    if (!formData.fotoVerifikasi) {
      return showMessage('Foto verifikasi wajib diambil untuk keamanan akun EAC', 'error');
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        timestamp: new Date().toISOString()
      };

      await fetch(GOOGLE_SCRIPT_EAC_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      showMessage('Permohonan akun EAC berhasil disubmit! 🎉', 'success');
      setFormData({ 
        noPerkara: '', 
        namaPihak: '', 
        nik: '', 
        email: '', 
        noHp: '',
        fotoVerifikasi: null,
        fotoKtp: null
      });
    } catch (error) {
      console.error('Error:', error);
      showMessage('Terjadi error saat mengirim permohonan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan form?')) {
      // Stop camera if active
      stopCamera();
      
      setFormData({ 
        noPerkara: '', 
        namaPihak: '', 
        nik: '', 
        email: '', 
        noHp: '',
        fotoVerifikasi: null,
        fotoKtp: null
      });
      setMessage('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-indigo-100 font-sans flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 md:py-6 px-4 md:px-5 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Permohonan Pengajuan Akun EAC</h1>
          <p className="text-green-100 text-sm md:text-base">Electronic Authentication Certificate - Pengadilan Agama Kalianda</p>
        </div>
      </div>

      {/* Alert */}
      {message && (
        <div className="mx-auto max-w-4xl mt-4 md:mt-6 px-4 md:px-5">
          <div className={`p-4 rounded-lg text-sm md:text-base font-medium ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">📸 {currentPhotoType === 'fotoVerifikasi' ? 'Foto Verifikasi' : 'Foto KTP'}</h3>
              <p className="text-sm text-gray-600">
                {currentPhotoType === 'fotoVerifikasi' ? 'Ambil foto selfie untuk verifikasi akun EAC' : 'Ambil foto KTP yang jelas dan terbaca'}
              </p>
            </div>
            
            {/* Camera Container */}
            <div className="relative mb-6 bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              
              {/* Video Element */}
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoReady ? 'opacity-100' : 'opacity-0'}`} style={{ minHeight: '300px' }} />
              
              {/* Loading State */}
              {!isVideoReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-800">
                  <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-lg font-semibold">Memuat Kamera...</p>
                  <p className="text-sm opacity-75 mt-1">Mohon tunggu sebentar</p>
                </div>
              )}
              
              {/* Camera Guide Overlay */}
              {isVideoReady && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Frame Guide */}
                  <div className="absolute inset-4 border-2 border-dashed border-white opacity-60 rounded-lg">
                    <div className="absolute inset-2 border-2 border-white opacity-40 rounded-lg"></div>
                  </div>
                  
                  {/* Center Guide for Selfie */}
                  {currentPhotoType === 'fotoVerifikasi' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm text-center">
                        <p>👤 Posisikan wajah di tengah</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Guide for KTP */}
                  {currentPhotoType === 'fotoKtp' && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm text-center">
                        <p>🆔 Pastikan KTP jelas terbaca</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                ❌ Batal
              </button>
              <button
                onClick={capturePhoto}
                disabled={!isVideoReady}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  isVideoReady 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isVideoReady ? '📷 Ambil Foto' : '⏳ Tunggu...'}
              </button>
            </div>
            
            {/* Tips */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-800 text-center">
                💡 <strong>Tips:</strong> Pastikan pencahayaan cukup dan {currentPhotoType === 'fotoVerifikasi' ? 'wajah terlihat jelas' : 'tulisan KTP terbaca'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Main Content (scrollable area) */}
      <div
        className="max-w-4xl mx-auto px-4 md:px-5 py-6 md:py-10 flex-1 overflow-y-auto min-h-0 touch-pan-y"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 10rem)' // ruang ekstra agar tombol tidak ketutup footer
        }}
      >
        {/* Form Fields */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          {/* Form Content */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 md:p-6 rounded-t-xl">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Form Permohonan Akun EAC</h2>
                <p className="text-green-100 text-sm">Lengkapi data di bawah dengan benar</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="space-y-6">
              {/* No Perkara */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                  No Perkara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="noPerkara"
                  value={formData.noPerkara}
                  onChange={handleInputChange}
                  placeholder="Contoh: 001/Pdt.G/2025/PA.Kla"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan nomor perkara yang valid</p>
              </div>

              {/* Nama Pihak */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                  Nama Pihak <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaPihak"
                  value={formData.namaPihak}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap sesuai KTP"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
              </div>

              {/* NIK */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                  NIK KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleInputChange}
                  placeholder="16 digit NIK"
                  maxLength="16"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">16 digit nomor induk kependudukan</p>
                  <span className={`text-xs ${formData.nik.length === 16 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formData.nik.length}/16
                  </span>
                </div>
              </div>

              {/* Email & No HP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contoh@email.com"
                    className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                    No HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="noHp"
                    value={formData.noHp}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    maxLength="15"
                    className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all text-sm md:text-base"
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Nomor WhatsApp aktif</p>
                    <span className={`text-xs ${formData.noHp.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.noHp.length} digit
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Verification Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-base md:text-lg font-bold text-blue-800 mb-4 flex items-center">
                  <span className="bg-blue-500 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Verifikasi Foto EAC <span className="text-red-500 ml-1">*</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Foto Verifikasi */}
                  <div>
                    <label className="block mb-2 font-semibold text-sm md:text-base text-gray-700">
                      Foto Verifikasi Identitas <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      {formData.fotoVerifikasi ? (
                        <div className="relative">
                          <img 
                            src={formData.fotoVerifikasi.data} 
                            alt="Foto Verifikasi" 
                            className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
                          />
                          <button
                            onClick={() => deletePhoto('fotoVerifikasi')}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-xs transition-all"
                          >
                            🗑️
                          </button>
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            ✅ Foto Tersimpan
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startCamera('fotoVerifikasi')}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          📷 Ambil Foto Selfie Verifikasi
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-blue-700 mt-2 italic">
                      Foto selfie diperlukan untuk verifikasi identitas akun EAC
                    </p>
                  </div>

                  {/* Foto KTP (Opsional) */}
                  <div>
                    <label className="block mb-2 font-semibold text-sm md:text-base text-gray-700">
                      Foto KTP (Opsional)
                    </label>
                    <div className="flex flex-col gap-3">
                      {formData.fotoKtp ? (
                        <div className="relative">
                          <img 
                            src={formData.fotoKtp.data} 
                            alt="Foto KTP" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                          />
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            ✅ Foto Tersimpan
                          </div>
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              onClick={() => deletePhoto('fotoKtp')}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-xs transition-all"
                              title="Hapus"
                            >
                              🗑️
                            </button>
                            <button
                              onClick={() => startCamera('fotoKtp')}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full text-xs transition-all"
                              title="Ambil Ulang dengan Kamera"
                            >
                              📷
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid">
                          <button
                            onClick={() => onPickFile('fotoKtp')}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            📎 Unggah File
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileChange}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-700 mt-2 italic">
                      Foto KTP dapat mempercepat proses verifikasi akun (opsional)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 md:py-4 px-8 md:px-12 rounded-lg transition-all shadow-lg text-sm md:text-base"
          >
            🔄 Reset Form
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full sm:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded-lg transition-all shadow-lg text-sm md:text-base`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim Permohonan...
              </span>
            ) : (
              '🚀 Submit Permohonan'
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-6 px-4 md:px-5 fixed bottom-0 left-0 right-0 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-sm md:text-base font-semibold mb-2">Sistem EAC - Pengadilan Agama Kalianda</p>
            <p className="text-xs text-gray-400">© 2023. Electronic Authentication Certificate System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormulirEAC;
