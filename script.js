// GANTI URL DI BAWAH INI DENGAN URL APPS SCRIPT GOOGLE SHEETS ANDA
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUsR5mM_0N3Mr401SBGoYYwYqerRgUu1gwBoxyWO58rSk8xvSlphdTf8tpKk7x0-TY/exec';

// Kredensial Login Admin
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// DOM Elements
const formPendaftaran = document.getElementById('formPendaftaran');
const formSection = document.getElementById('form-section');
const sectionAdmin = document.getElementById('sectionAdmin');
const modalLogin = document.getElementById('modalLogin');
const formLogin = document.getElementById('formLogin');
const loginError = document.getElementById('loginError');

const btnOpenLogin = document.getElementById('btnOpenLogin');
const btnCloseLogin = document.getElementById('btnCloseLogin');
const btnLogout = document.getElementById('btnLogout');
const btnExport = document.getElementById('btnExport');
const btnClearAll = document.getElementById('btnClearAll');
const inputSearch = document.getElementById('inputSearch');

let globalDataPendaftar = []; // Cache data dari Google Sheet

// 1. Submit Form Pendaftaran ke Google Sheets
formPendaftaran.addEventListener('submit', function (e) {
  e.preventDefault();

  const btnSubmit = formPendaftaran.querySelector('.btn-submit-blue');
  const originalBtnContent = btnSubmit.innerHTML;
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span>Mengirim Data...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

  const payload = new URLSearchParams();

  payload.append('nama', document.getElementById('nama').value.trim());
  payload.append('nim', document.getElementById('nim').value.trim());
  payload.append('prodi', document.getElementById('prodi').value);
  payload.append('semester', document.getElementById('semester').value);
  payload.append('nowa', document.getElementById('nowa').value.trim());
  payload.append('email', document.getElementById('email').value.trim());
  payload.append('alamat', document.getElementById('alamat').value.trim());
  payload.append('alasan', document.getElementById('alasan').value.trim());

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: payload
  })
    .then(response => response.json())
    .then(data => {
      alert('Pendaftaran Berhasil! Data Anda telah tersimpan di sistem pusat.');
      formPendaftaran.reset();
    })
    .catch(error => {
      console.error('Error!', error.message);
      alert('Gagal mengirim data. Silakan pastikan koneksi internet Anda lancar.');
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalBtnContent;
    });
});

// 2. Fetch Data dari Google Sheets untuk Dashboard Admin
function loadDataFromGoogleSheets() {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#2563eb; padding:20px;">Memuat data dari Google Sheets... <i class="fa-solid fa-spinner fa-spin"></i></td></tr>';

  fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
      globalDataPendaftar = data;
      renderAdminTable();
    })
    .catch(err => {
      console.error(err);
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:20px;">Gagal mengambil data. Pastikan URL Apps Script sudah dimasukkan dengan benar.</td></tr>';
    });
}

// 3. Render Data ke Tabel Admin
function renderAdminTable(filterText = '') {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  const filteredData = globalDataPendaftar.filter((item) => {
    const text = filterText.toLowerCase();
    return (
      (item.nama && item.nama.toString().toLowerCase().includes(text)) ||
      (item.nim && item.nim.toString().toLowerCase().includes(text)) ||
      (item.prodi && item.prodi.toString().toLowerCase().includes(text)) ||
      (item.semester && item.semester.toString().toLowerCase().includes(text))
    );
  });

  // Update statistik
  document.getElementById('statTotal').innerText = globalDataPendaftar.length;
  
  const todayStr = new Date().toLocaleDateString('id-ID');
  document.getElementById('statToday').innerText = globalDataPendaftar.filter(item => {
    if(!item.tanggal) return false;
    return new Date(item.tanggal).toLocaleDateString('id-ID') === todayStr;
  }).length;

  if (filteredData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b; padding:20px;">Belum ada data pendaftar.</td></tr>';
    return;
  }

  filteredData.forEach((item, index) => {
    let formattedWa = (item.nowa || '').toString().replace(/[^0-9]/g, '');
    if (formattedWa.startsWith('0')) {
      formattedWa = '62' + formattedWa.slice(1);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${item.nama}</strong><br><small style="color:#64748b;">${item.email}</small></td>
      <td>${item.nim}<br><small style="color:#2563eb; font-weight:600;">${item.prodi} (${item.semester || '-'})</small></td>
      <td>
        <a href="https://wa.me/${formattedWa}" target="_blank" class="btn-wa">
          <i class="fa-brands fa-whatsapp"></i> ${item.nowa}
        </a>
      </td>
      <td>${item.alamat}</td>
      <td style="max-width:200px;">${item.alasan}</td>
      <td>
        <a href="https://wa.me/${formattedWa}" target="_blank" style="color:#2563eb; text-decoration:none; font-weight:700;">
          <i class="fa-solid fa-paper-plane"></i> Hubungi
        </a>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// 4. Modal Login Events
btnOpenLogin.addEventListener('click', () => {
  modalLogin.classList.remove('hidden');
});

btnCloseLogin.addEventListener('click', () => {
  modalLogin.classList.add('hidden');
  loginError.classList.add('hidden');
});

formLogin.addEventListener('submit', function (e) {
  e.preventDefault();
  const user = document.getElementById('adminUsername').value;
  const pass = document.getElementById('adminPassword').value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    modalLogin.classList.add('hidden');
    formSection.classList.add('hidden');
    sectionAdmin.classList.remove('hidden');
    formLogin.reset();
    loginError.classList.add('hidden');
    
    loadDataFromGoogleSheets();
  } else {
    loginError.classList.remove('hidden');
  }
});

btnLogout.addEventListener('click', () => {
  sectionAdmin.classList.add('hidden');
  formSection.classList.remove('hidden');
});

// 5. Filter & Export Events
inputSearch.addEventListener('input', (e) => {
  renderAdminTable(e.target.value);
});

btnExport.addEventListener('click', () => {
  if (globalDataPendaftar.length === 0) {
    alert('Tidak ada data untuk di-export!');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'No,Nama,NIM,Prodi,Semester,No WA,Email,Alamat,Alasan,Tanggal Daftar\n';

  globalDataPendaftar.forEach((item, index) => {
    const row = [
      index + 1,
      `"${item.nama}"`,
      `"${item.nim}"`,
      `"${item.prodi}"`,
      `"${item.semester || '-'}"`,
      `"${item.nowa}"`,
      `"${item.email}"`,
      `"${item.alamat}"`,
      `"${item.alasan ? item.alasan.replace(/\n/g, ' ') : ''}"`,
      `"${item.tanggal}"`,
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Pendaftar_UKM_Multimedia_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

btnClearAll.addEventListener('click', () => {
  alert('Untuk menghapus seluruh data, silakan hapus langsung baris pendaftar pada dokumen Google Sheets Anda.');
});