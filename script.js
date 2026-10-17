const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUsR5mM_0N3Mr401SBGoYYwYqerRgUu1gwBoxyWO58rSk8xvSlphdTf8tpKk7x0-TY/exec';

const formPendaftaran = document.getElementById('formPendaftaran');

if (formPendaftaran) {
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
}