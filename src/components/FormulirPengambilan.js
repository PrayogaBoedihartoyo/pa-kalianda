import React, { useState } from 'react';

// Ganti dengan URL Apps Script kamu untuk form pengambilan
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOP4CIfmdSkS6Dx9hAelKxQnu9B1t2ZOaLz1Aq3gsAw7s-n2WVAITJyCO10WfM4RuE/exec';

function FormulirPengambilan() {
  const [formData, setFormData] = useState({
    nomorPerkara: '',
    namaPihak: '',
    nikKtp: '',
    alamat: '',
    tanggalPermohonan: '',
    tempatPengambilan: '',
    tanggalPengambilan: '',
    waktuPengambilan: '',
    namaKuasa: '',
    alamatKuasa: '',
    hubunganKuasa: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleSimpan = async () => {
    // Validasi basic
    if (!formData.nomorPerkara || !formData.namaPihak || !formData.nikKtp || !formData.alamat) {
      showMessage('Mohon isi semua field yang wajib', 'error');
      return;
    }

    if (!formData.tanggalPermohonan || !formData.tempatPengambilan || !formData.tanggalPengambilan || !formData.waktuPengambilan) {
      showMessage('Mohon isi semua field yang wajib', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      showMessage('Data berhasil disimpan ke Database! 📊', 'success');
      
      // Reset form setelah berhasil
      setFormData({
        nomorPerkara: '',
        namaPihak: '',
        nikKtp: '',
        alamat: '',
        tanggalPermohonan: '',
        tempatPengambilan: '',
        tanggalPengambilan: '',
        waktuPengambilan: '',
        namaKuasa: '',
        alamatKuasa: '',
        hubunganKuasa: ''
      });

    } catch (error) {
      console.error('Error:', error);
      showMessage('Terjadi error saat menyimpan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKembali = () => {
    if (window.confirm('Apakah Anda yakin ingin kembali? Data yang belum disimpan akan hilang.')) {
      setFormData({
        nomorPerkara: '',
        namaPihak: '',
        nikKtp: '',
        alamat: '',
        tanggalPermohonan: '',
        tempatPengambilan: '',
        tanggalPengambilan: '',
        waktuPengambilan: '',
        namaKuasa: '',
        alamatKuasa: '',
        hubunganKuasa: ''
      });
      setMessage('');
    }
  };

  return (
    <div
      className="bg-gray-100 font-sans flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}  // dynamic viewport untuk mobile
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
          <div className={`p-3 md:p-4 rounded-md text-sm ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Main Content: scrollable area */}
      <div
        className="max-w-7xl mx-auto px-4 md:px-5 py-4 md:py-6 bg-white flex-1 overflow-y-auto min-h-0"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 11rem)' // ruang ekstra biar tombol tidak ketutup footer
        }}
      >
        {/* Form Container */}
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

            {/* Date/Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal Permohonan */}
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

              {/* Tempat Pengambilan */}
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
                  <option value="Kantor PA Kalianda">Kantor PA Kalianda</option>
                  <option value="Kantor Cabang Lampung Selatan">Kantor Cabang Lampung Selatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Pickup Date/Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal Pengambilan */}
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

              {/* Waktu Pengambilan */}
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
                <h3 className="text-base md:text-lg font-bold text-gray-800">
                  Data Kuasa
                </h3>
              </div>
              
              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 italic">
                Isi jika permohonan melalui kuasa hukum
              </p>

              <div className="space-y-4 md:space-y-5">
                {/* Nama Kuasa */}
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

                {/* Alamat Kuasa */}
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

                {/* Hubungan Kuasa */}
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
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-2">
                Informasi Penting
              </h3>
              <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                Data yang disimpan akan langsung masuk ke database dan dapat dilihat secara real-time oleh admin. 
                Pastikan semua data sudah benar sebelum menyimpan.
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
            className={`w-full sm:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'} text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg transition-all shadow-lg text-sm md:text-base order-1 sm:order-2`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </span>
            ) : (
              '📊 Submit Permohonan'
            )}
          </button>
        </div>
      </div>

      {/* Footer (fixed) */}
      <div
        className="bg-gray-900 text-white py-4 md:py-6 px-4 md:px-5 fixed bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
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
}

export default FormulirPengambilan;