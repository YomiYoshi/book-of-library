const BASE_URL = 'http://localhost:8000'

function toggleHamburgerIcon(el) { //เปลี่ยน icon จาก 3 เส้นเป็น X
  el.classList.toggle("change");
}

//ทำเชื่อมกดเข้าไปหา menu ใน icon ขีด 3 เส้น
const myMenu = document.getElementById('myMenu');
const hamIcon = document.getElementById('hamIcon');

hamIcon.addEventListener('click', function () {
  if (myMenu.style.display === 'block') {
    myMenu.style.display = 'none';
  } else {
    myMenu.style.display = 'block';
  }
});

/*ฟังชั่นอัปเดตสถานะ Status*/
const updateStatus = async (book_id, status) => {
  try {
    console.log(`🔄 Updating ID: ${book_id}, Status: ${status}`);

    if (!book_id || !status) {
      console.error("⛔ ID or Status is missing!");
      return;
    }

    await axios.put(`${BASE_URL}/users/${book_id}`, { status: status });

    const statusCell = document.getElementById(`status-${book_id}`);
    if (statusCell) {
      statusCell.textContent = status;
      statusCell.classList.remove("status-approved", "status-pending");
      if (status === "Borrowed") {
        statusCell.classList.add("status-approved");
      }
    } else {
      console.warn(`Element status-${book_id} not found`);
    }
  } catch (error) {
    console.error('Error update status', error);
  }
};

window.onload = async () => {
  await loadData()
}
const loadData = async () => {
  console.log('user page loaded')
  //1. load user ทั้งหมด จาก api ที่เตรียมไว้
  const response = await axios.get(`${BASE_URL}/users`)
  console.log(response.data)
  const bookDOM = document.getElementById('books')
  //2. นำ user ทั้งหมด โหลดกลับเข้าไปใน html


  // ตารางข้อมูล user จะแสดงข้อมูลทั้งหมดที่มีใน database
  let htmlData = `
  <table border="1" cellspacing="1" cellpadding="10">
      <thead>
          <tr>
              <th>Book ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Publisher Year</th>
              <th>Category</th>
              <th>ISBM</th>
              <th>Page Count</th>
              <th>Status</th>
              <th>Action</th>
              <th>Borrow</th>
          </tr>
      </thead>
      <tbody>
  `;

  for (let i = 0; i < response.data.length; i++) {
    let users = response.data[i];
    htmlData += ` 
      <tr>
          <td>${users.book_id}</td>
          <td>${users.title}</td>
          <td>${users.author}</td>
          <td>${users.publisher}</td>
          <td>${users.publisher_year}</td>
          <td>${users.category || '-'}</td>
          <td>${users.isbn}</td>
          <td>${users.page_count}</td>
          <td id="status-${users.book_id}" class="status">${users.status || 'Available'}</td>
          <td>
          <a href="book_info.html?book_id=${users.book_id}"><button class='Edit'>Edit</button></a>
          <button class="delete" data-book_id="${users.book_id}">Delete</button>
          </td>

          <td>
          <a href="Result.html">
          <button class="borrow" data-book_id="${users.book_id}" data-status='Borrowed'><span class="material-symbols-outlined">
          login</span></button></a>
          </td>
      </tr>
    `;
  }

  htmlData += `
            </tbody>
        </table>
    `;
  bookDOM.innerHTML = htmlData;
  // ตารางข้อมูล user จะแสดงข้อมูลทั้งหมดที่มีใน database(จบ)


  //3. ลบ user
  document.querySelectorAll('.delete').forEach(button => {
    button.addEventListener('click', async (event) => {
      const id = event.target.closest(".delete").dataset.book_id;
      if (!id) {
        console.error("Book_ID not found!");
        return;
      }
        try {
          await axios.delete(`${BASE_URL}/users/${id}`);
          console.log(`Deleted Book with ID: ${id}`);
          loadData(); // โหลดข้อมูลใหม่หลังจากลบ
        } catch (error) {
          console.error("Error deleting Book:", error);
        }
    }
   )
  })

  // 4 ค้นหา
  const filterDOM = document.getElementById('filter')
  filterDOM.addEventListener('keyup', (event) => { // keyup = เมื่อมีการพิมพ์ใน input จะทำงาน
    const filterValue = event.target.value.toLowerCase() // แปลงเป็นตัวพิมพ์เล็กทั้งหมด
    const rows = bookDOM.getElementsByTagName('tr')

    // ลูปผ่านข้อมูลแต่ละแถวในตาราง
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td') // ดึงข้อมูลแต่ละแถวในตาราง
      let rowContainsFilterValue = false // ตัวแปรเช็คว่าแถวนี้มีค่าที่ค้นหาหรือไม่

      // ลูปผ่านข้อมูลแต่ละเซลล์ในแถว
      for (let j = 0; j < cells.length; j++) {
        if (cells[j].innerText.toLowerCase().includes(filterValue)) { // ตรวจสอบว่าแถวนี้มีค่าที่ค้นหาหรือไม่
          rowContainsFilterValue = true
          break
        }
      }
      // ถ้าแถวไหนมีค่าตรงกับคำที่ค้นหาให้แสดง ถ้าไม่ใช่คำที่ค้นหาให้ซ่อน
      rows[i].style.display = rowContainsFilterValue ? '' : 'none'
    }
  })

  /*5. สร้าง event สำหรับการจัดเรียงข้อมูล*/
  document.addEventListener('click', async (event) => {
    if (event.target.closest('.borrow')) {
        event.preventDefault();
        const button = event.target.closest('.borrow');
        const id = button.dataset.book_id;
        const status = button.dataset.status;
        console.log(`Borrow Clicked: ID=${id}, Status=${status}`);

        if (id && status) {
            await updateStatus(id, status);
            window.location.href = "Result.html"; // ไปยัง Result.html หลังอัปเดต
        } else {
            console.error("Book_ID or Status not found!");
        }
    }
  })

}
