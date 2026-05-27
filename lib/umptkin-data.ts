export type UinPtkin = {
  id: string;
  nama: string;
  kota: string;
  provinsi: string;
  singkatan: string;
  jenis: "UIN" | "IAIN" | "STAIN";
  url: string;
};

export const daftarUinPtkin: UinPtkin[] = [
  // UIN
  { id: "uin-jakarta", nama: "UIN Syarif Hidayatullah Jakarta", kota: "Tangerang Selatan", provinsi: "Banten", singkatan: "UIN Jakarta", jenis: "UIN", url: "https://www.uinjkt.ac.id" },
  { id: "uin-bandung", nama: "UIN Sunan Gunung Djati Bandung", kota: "Bandung", provinsi: "Jawa Barat", singkatan: "UIN Bandung", jenis: "UIN", url: "https://www.uinsgd.ac.id" },
  { id: "uin-yogyakarta", nama: "UIN Sunan Kalijaga Yogyakarta", kota: "Yogyakarta", provinsi: "D.I. Yogyakarta", singkatan: "UIN Yogyakarta", jenis: "UIN", url: "https://www.uin-suka.ac.id" },
  { id: "uin-malang", nama: "UIN Maulana Malik Ibrahim Malang", kota: "Malang", provinsi: "Jawa Timur", singkatan: "UIN Malang", jenis: "UIN", url: "https://www.uin-malang.ac.id" },
  { id: "uin-surabaya", nama: "UIN Sunan Ampel Surabaya", kota: "Surabaya", provinsi: "Jawa Timur", singkatan: "UIN Surabaya", jenis: "UIN", url: "https://www.uinsby.ac.id" },
  { id: "uin-semarang", nama: "UIN Walisongo Semarang", kota: "Semarang", provinsi: "Jawa Tengah", singkatan: "UIN Semarang", jenis: "UIN", url: "https://www.walisongo.ac.id" },
  { id: "uin-medan", nama: "UIN Sumatera Utara Medan", kota: "Medan", provinsi: "Sumatera Utara", singkatan: "UIN Medan", jenis: "UIN", url: "https://www.uinsu.ac.id" },
  { id: "uin-pekanbaru", nama: "UIN Sultan Syarif Kasim Riau", kota: "Pekanbaru", provinsi: "Riau", singkatan: "UIN Riau", jenis: "UIN", url: "https://www.uin-suska.ac.id" },
  { id: "uin-padang", nama: "UIN Imam Bonjol Padang", kota: "Padang", provinsi: "Sumatera Barat", singkatan: "UIN Padang", jenis: "UIN", url: "https://www.uinib.ac.id" },
  { id: "uin-palembang", nama: "UIN Raden Fatah Palembang", kota: "Palembang", provinsi: "Sumatera Selatan", singkatan: "UIN Palembang", jenis: "UIN", url: "https://www.radenfatah.ac.id" },
  { id: "uin-banjarmasin", nama: "UIN Antasari Banjarmasin", kota: "Banjarmasin", provinsi: "Kalimantan Selatan", singkatan: "UIN Banjarmasin", jenis: "UIN", url: "https://www.uin-antasari.ac.id" },
  { id: "uin-makassar", nama: "UIN Alauddin Makassar", kota: "Gowa", provinsi: "Sulawesi Selatan", singkatan: "UIN Makassar", jenis: "UIN", url: "https://www.uin-alauddin.ac.id" },
  { id: "uin-manado", nama: "UIN Datokarama Palu", kota: "Palu", provinsi: "Sulawesi Tengah", singkatan: "UIN Palu", jenis: "UIN", url: "https://www.iainpalu.ac.id" },
  { id: "uin-mataram", nama: "UIN Mataram", kota: "Mataram", provinsi: "Nusa Tenggara Barat", singkatan: "UIN Mataram", jenis: "UIN", url: "https://www.uinmataram.ac.id" },
  { id: "uin-lampung", nama: "UIN Raden Intan Lampung", kota: "Bandar Lampung", provinsi: "Lampung", singkatan: "UIN Lampung", jenis: "UIN", url: "https://www.radenintan.ac.id" },

  // IAIN
  { id: "iain-pontianak", nama: "IAIN Pontianak", kota: "Pontianak", provinsi: "Kalimantan Barat", singkatan: "IAIN Pontianak", jenis: "IAIN", url: "https://www.iainptk.ac.id" },
  { id: "iain-palangkaraya", nama: "IAIN Palangka Raya", kota: "Palangka Raya", provinsi: "Kalimantan Tengah", singkatan: "IAIN Palangka Raya", jenis: "IAIN", url: "https://www.iain-palangkaraya.ac.id" },
  { id: "iain-samarinda", nama: "IAIN Samarinda", kota: "Samarinda", provinsi: "Kalimantan Timur", singkatan: "IAIN Samarinda", jenis: "IAIN", url: "https://www.iain-samarinda.ac.id" },
  { id: "iain-bengkulu", nama: "IAIN Bengkulu", kota: "Bengkulu", provinsi: "Bengkulu", singkatan: "IAIN Bengkulu", jenis: "IAIN", url: "https://www.iainbengkulu.ac.id" },
  { id: "iain-jambi", nama: "IAIN Sulthan Thaha Saifuddin Jambi", kota: "Jambi", provinsi: "Jambi", singkatan: "IAIN Jambi", jenis: "IAIN", url: "https://www.iainsts.ac.id" },
  { id: "iain-banda-aceh", nama: "UIN Ar-Raniry Banda Aceh", kota: "Banda Aceh", provinsi: "Aceh", singkatan: "UIN Ar-Raniry", jenis: "UIN", url: "https://www.ar-raniry.ac.id" },
  { id: "iain-lhokseumawe", nama: "IAIN Lhokseumawe", kota: "Lhokseumawe", provinsi: "Aceh", singkatan: "IAIN Lhokseumawe", jenis: "IAIN", url: "https://www.iain-lhokseumawe.ac.id" },
  { id: "iain-langsa", nama: "IAIN Langsa", kota: "Langsa", provinsi: "Aceh", singkatan: "IAIN Langsa", jenis: "IAIN", url: "https://www.iainlangsa.ac.id" },
  { id: "iain-cirebon", nama: "IAIN Syekh Nurjati Cirebon", kota: "Cirebon", provinsi: "Jawa Barat", singkatan: "IAIN Cirebon", jenis: "IAIN", url: "https://www.syekhnurjati.ac.id" },
  { id: "iain-kediri", nama: "IAIN Kediri", kota: "Kediri", provinsi: "Jawa Timur", singkatan: "IAIN Kediri", jenis: "IAIN", url: "https://www.iainkediri.ac.id" },
  { id: "iain-jember", nama: "UIN KHAS Jember", kota: "Jember", provinsi: "Jawa Timur", singkatan: "UIN Jember", jenis: "UIN", url: "https://www.uinkhasjember.ac.id" },
  { id: "iain-purwokerto", nama: "UIN Prof. K.H. Saifuddin Zuhri Purwokerto", kota: "Purwokerto", provinsi: "Jawa Tengah", singkatan: "UIN Purwokerto", jenis: "UIN", url: "https://www.uinsaizu.ac.id" },
  { id: "iain-surakarta", nama: "UIN Raden Mas Said Surakarta", kota: "Surakarta", provinsi: "Jawa Tengah", singkatan: "UIN Surakarta", jenis: "UIN", url: "https://www.uinsaid.ac.id" },
  { id: "iain-kudus", nama: "IAIN Kudus", kota: "Kudus", provinsi: "Jawa Tengah", singkatan: "IAIN Kudus", jenis: "IAIN", url: "https://www.iainkudus.ac.id" },
  { id: "iain-pekalongan", nama: "IAIN Pekalongan", kota: "Pekalongan", provinsi: "Jawa Tengah", singkatan: "IAIN Pekalongan", jenis: "IAIN", url: "https://www.iainpekalongan.ac.id" },
  { id: "iain-bukittinggi", nama: "IAIN Bukittinggi", kota: "Bukittinggi", provinsi: "Sumatera Barat", singkatan: "IAIN Bukittinggi", jenis: "IAIN", url: "https://www.iainbukittinggi.ac.id" },
  { id: "iain-batusangkar", nama: "IAIN Batusangkar", kota: "Batusangkar", provinsi: "Sumatera Barat", singkatan: "IAIN Batusangkar", jenis: "IAIN", url: "https://www.iainbatusangkar.ac.id" },
  { id: "iain-kendari", nama: "IAIN Kendari", kota: "Kendari", provinsi: "Sulawesi Tenggara", singkatan: "IAIN Kendari", jenis: "IAIN", url: "https://www.iainkendari.ac.id" },
  { id: "iain-ambon", nama: "IAIN Ambon", kota: "Ambon", provinsi: "Maluku", singkatan: "IAIN Ambon", jenis: "IAIN", url: "https://www.iainambon.ac.id" },
  { id: "iain-ternate", nama: "IAIN Ternate", kota: "Ternate", provinsi: "Maluku Utara", singkatan: "IAIN Ternate", jenis: "IAIN", url: "https://www.iain-ternate.ac.id" },
  { id: "iain-sorong", nama: "IAIN Sorong", kota: "Sorong", provinsi: "Papua Barat", singkatan: "IAIN Sorong", jenis: "IAIN", url: "https://www.iainsorong.ac.id" },
  { id: "iain-curup", nama: "IAIN Curup", kota: "Curup", provinsi: "Bengkulu", singkatan: "IAIN Curup", jenis: "IAIN", url: "https://www.iaincurup.ac.id" },
  { id: "iain-madura", nama: "IAIN Madura", kota: "Pamekasan", provinsi: "Jawa Timur", singkatan: "IAIN Madura", jenis: "IAIN", url: "https://www.iainmadura.ac.id" },
  { id: "iain-bone", nama: "IAIN Bone", kota: "Watampone", provinsi: "Sulawesi Selatan", singkatan: "IAIN Bone", jenis: "IAIN", url: "https://www.iain-bone.ac.id" },
];

export const uinCount = daftarUinPtkin.filter((u) => u.jenis === "UIN").length;
export const iainCount = daftarUinPtkin.filter((u) => u.jenis === "IAIN").length;
