import React from "react";
import { Link } from "react-router-dom";

export default function Navigation() {
  const menus = [
    {
      key: "salinan",
      to: "/pengambilan",
      header1: "Permohonan Pengambilan",
      header2: "Akta-Cerai",
      caption: "FORMULIR PENGAMBILAN",
      img: "/assets/pengambilan.png",
      emoji: "📄",
    },
    {
      key: "eac",
      to: "/eac",
      header1: "Permohonan Pengajuan Akun EAC",
      header2: "Produk Akta Cerai",
      caption: "Pengajuan Akun EAC",
      img: "/assets/akta-cerai.png",
      emoji: "📘",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-[1100px] mx-auto my-4 px-3 sm:px-4">
        {/* Header hijau */}
        <section
          className="bg-green-600 text-white border border-green-700 rounded-md px-5 py-4 shadow-inner"
          role="banner"
        >
          <div className="font-bold text-base sm:text-lg">
            Selamat Datang Di Aplikasi SI-DINA
          </div>
        </section>

        {/* Subheader */}
        <section className="bg-[#e9f6ee] border border-[#cfe8d8] text-[#244b36] text-center rounded mt-3 mb-2 px-3 py-2">
          <div className="text-xs sm:text-[13px]">Silahkan Pilih Menu Dibawah Ini</div>
        </section>

        {/* Grid: 1 kolom di mobile, 2 kolom mulai md (>=768px) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 my-3" aria-label="Menu Utama">
          {menus.map((m) => (
            <Link
              key={m.key}
              to={m.to}
              className="group w-full h-full flex flex-col bg-white rounded-md border border-slate-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 transition"
              aria-label={m.caption}
            >
              {/* Header kartu */}
              <div className="bg-green-600 text-white text-center py-3 px-3 border-b border-green-700">
                <div className="font-bold text-sm sm:text-[14px] leading-tight">{m.header1}</div>
                <div className="text-xs sm:text-[13px]">{m.header2}</div>
              </div>

              {/* Body kartu */}
              <div className="bg-white p-4 sm:p-5 flex flex-col items-center gap-3">
                {/* Lingkaran gambar (skala responsif) */}
                <div
                  className="size-32 sm:size-36 md:size-[170px] rounded-full grid place-items-center overflow-hidden border-[6px] sm:border-8 border-[#eaf1f5]"
                  style={{
                    background:
                      "radial-gradient(100px 100px at 32% 28%, #fff 0, #fff 55%, #e9eef2 56%, #dbe3ea 100%)",
                  }}
                >
                  {m.img ? (
                    <img
                      src={m.img}
                      alt={m.caption}
                      loading="lazy"
                      className="w-[85%] h-[85%] object-contain rounded-full block"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl" aria-hidden="true">{m.emoji}</span>
                  )}
                </div>

                <div className="uppercase font-extrabold tracking-wide text-sm sm:text-[14px] text-neutral-900 text-center">
                  {m.caption}
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-3 p-3 text-slate-500 border-t border-slate-200 bg-white rounded">
          <div>
            SI-DINA © Copyright By Pengadilan Agama Kalianda
            <div className="text-[11px] mt-1 text-slate-400">© 2023. marjinal5454</div>
          </div>
          <div className="text-[12px]">Version 4.4.0</div>
        </footer>
      </div>
    </main>
  );
}