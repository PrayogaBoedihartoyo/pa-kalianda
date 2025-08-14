import React, { useState, useEffect } from 'react';

// Ganti dengan URL Apps Script untuk EAC
const GOOGLE_SCRIPT_EAC_URL = 'https://script.google.com/macros/s/AKfycbyLESA480JKP9PMNzISw4PZ7sLm2X2-aFrDkLQvlaZnEHEy8VUvYH6y7JsbWmwunGsr/exec';

function FormulirEAC() {
  const [formData, setFormData] = useState({
    noPerkara: '',
    namaPihak: '',
    nik: '',
    email: '',
    noHp: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Kunci scroll halaman saat komponen ini aktif
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlHeight = document.documentElement.style.height;
    const prevBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.height = prevHtmlHeight;
      document.body.style.height = prevBodyHeight;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format NIK (hanya angka, max 16 digit)
    if (name === 'nik') {
      const numericValue = value.replace(/\D/g, '').slice(0, 16);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    // Format No HP (hanya angka, max 15 digit)
    if (name === 'noHp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 15);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Validasi
    if (!formData.noPerkara.trim()) {
      showMessage('No Perkara harus diisi', 'error');
      return;
    }

    if (!formData.namaPihak.trim()) {
      showMessage('Nama Pihak harus diisi', 'error');
      return;
    }

    if (!formData.nik.trim() || formData.nik.length !== 16) {
      showMessage('NIK harus diisi dengan 16 digit', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showMessage('Email harus diisi', 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      showMessage('Format email tidak valid', 'error');
      return;
    }

    if (!formData.noHp.trim() || formData.noHp.length < 10) {
      showMessage('No HP harus diisi minimal 10 digit', 'error');
      return;
    }

    setLoading(true);

    try {
      await fetch(GOOGLE_SCRIPT_EAC_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      showMessage('Permohonan akun EAC berhasil disubmit! 🎉', 'success');

      // Reset form
      setFormData({
        noPerkara: '',
        namaPihak: '',
        nik: '',
        email: '',
        noHp: ''
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
      setFormData({
        noPerkara: '',
        namaPihak: '',
        nik: '',
        email: '',
        noHp: ''
      });
      setMessage('');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 font-sans flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 md:py-6 px-4 md:px-5 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            Permohonan Pengajuan Akun EAC
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Electronic Authentication Certificate - Pengadilan Agama Kalianda
          </p>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className="mx-auto max-w-4xl mt-4 md:mt-6 px-4 md:px-5">
          <div className={`p-4 rounded-lg text-sm md:text-base font-medium ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-5 py-6 md:py-10 flex-1 overflow-hidden min-h-0 pb-28">
        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 md:p-6 rounded-t-xl">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Form Permohonan Akun EAC</h2>
                <p className="text-blue-100 text-sm">Lengkapi data di bawah dengan benar</p>
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
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm md:text-base"
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
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm md:text-base"
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
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm md:text-base"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">16 digit nomor induk kependudukan</p>
                  <span className={`text-xs ${formData.nik.length === 16 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formData.nik.length}/16
                  </span>
                </div>
              </div>

              {/* Row untuk Email dan No HP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
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
                    className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm md:text-base"
                    required
                  />
                </div>

                {/* No HP */}
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
                    className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm md:text-base"
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
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 md:p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-amber-500 p-2 rounded-lg mr-4 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 text-sm md:text-base mb-2">
                Penting untuk Diperhatikan:
              </h3>
              <ul className="text-xs md:text-sm text-amber-700 space-y-1">
                <li>• Pastikan data yang diisi sudah benar dan sesuai dengan dokumen resmi</li>
                <li>• Email dan No HP akan digunakan untuk komunikasi lebih lanjut</li>
                <li>• Proses persetujuan akun EAC membutuhkan waktu 1-3 hari kerja</li>
                <li>• Anda akan mendapat notifikasi melalui email setelah akun disetujui</li>
              </ul>
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
            className={`w-full sm:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded-lg transition-all shadow-lg text-sm md:text-base`}
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
      <div className="bg-gray-900 text-white py-6 px-4 md:px-5 fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-sm md:text-base font-semibold mb-2">
              Sistem EAC - Pengadilan Agama Kalianda
            </p>
            <p className="text-xs text-gray-400">
              © 2023. Electronic Authentication Certificate System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormulirEAC;